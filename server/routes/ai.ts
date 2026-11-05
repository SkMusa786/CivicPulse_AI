import { GoogleGenAI } from '@google/genai';
import { randomUUID } from 'node:crypto';
import express, { Router, type Response } from 'express';
import { authenticate, requireRole, type AuthenticatedRequest } from '../auth';
import { config } from '../config';
import { storeImage } from '../imageStorage';
import { SpotGuardModel } from '../models/SpotGuard';

const router = Router();
const maxImageSize = '10mb';
const imageTypes = new Set(['image/jpeg', 'image/png', 'image/webp']);

const getMimeType = (req: AuthenticatedRequest): string =>
  (req.header('content-type') || '').split(';', 1)[0].trim().toLowerCase();

const validateImageType = (req: AuthenticatedRequest, res: Response, next: express.NextFunction): void => {
  if (!imageTypes.has(getMimeType(req))) {
    res.status(415).json({ error: 'Upload a JPEG, PNG, or WEBP image.' });
    return;
  }
  next();
};

const imageBody = express.raw({
  type: (req) => imageTypes.has((req.headers['content-type'] || '').split(';', 1)[0].trim().toLowerCase()),
  limit: maxImageSize,
});

const hasValidImageSignature = (buffer: Buffer, mimeType: string): boolean => {
  if (mimeType === 'image/jpeg') {
    return buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
  }
  if (mimeType === 'image/png') {
    return buffer.length >= 8 && buffer.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));
  }
  if (mimeType === 'image/webp') {
    return buffer.length >= 12 && buffer.toString('ascii', 0, 4) === 'RIFF' && buffer.toString('ascii', 8, 12) === 'WEBP';
  }
  return false;
};

const getImage = (req: AuthenticatedRequest, res: Response): { data: string; mimeType: string } | null => {
  const mimeType = getMimeType(req);
  if (!Buffer.isBuffer(req.body) || req.body.length === 0) {
    res.status(400).json({ error: 'An image upload is required.' });
    return null;
  }
  if (!hasValidImageSignature(req.body, mimeType)) {
    res.status(415).json({ error: 'The uploaded file does not match its declared image type.' });
    return null;
  }
  return { data: req.body.toString('base64'), mimeType };
};

const getClient = (res: Response): GoogleGenAI | null => {
  if (!config.geminiApiKey) {
    res.status(503).json({ error: 'Gemini AI is not configured. Set GEMINI_API_KEY on the API server.' });
    return null;
  }
  return new GoogleGenAI({
    apiKey: config.geminiApiKey,
    httpOptions: {
      timeout: 60_000,
      retryOptions: { attempts: 3, initialDelay: 1, maxDelay: 5 },
    },
  });
};

const respondWithGeminiError = (res: Response, error: unknown, fallback: string): void => {
  const details = error && typeof error === 'object'
    ? error as { status?: number; code?: string; name?: string; message?: string }
    : {};
  console.error('Gemini request failed', {
    name: details.name,
    status: details.status,
    code: details.code,
    message: details.message,
  });
  if (details.status === 429 || details.code === 'RESOURCE_EXHAUSTED') {
    res.status(429).json({ error: 'Gemini is rate limited or the project quota is exhausted. Please retry later.' });
    return;
  }
  if (
    details.status === 408 || details.status === 504 ||
    details.code === 'DEADLINE_EXCEEDED' ||
    details.name === 'AbortError' ||
    /timeout|timed out/i.test(details.message || '')
  ) {
    res.status(504).json({ error: 'Gemini took too long to respond. Please retry with a smaller image.' });
    return;
  }
  if (details.status === 401 || details.status === 403) {
    res.status(503).json({ error: 'Gemini rejected the configured API credentials. Check GEMINI_API_KEY on the API server.' });
    return;
  }
  res.status(502).json({ error: fallback });
};

const categories = [
  'Roads & Pavements',
  'Garbage & Sanitation',
  'Street Lighting',
  'Water Supply & Sewage',
  'Parks & Public Spaces',
  'Traffic & Signage',
  'Public Health & Hazards',
] as const;
const severities = ['Low', 'Medium', 'High', 'Critical'] as const;
const departments = [
  'Public Works Department',
  'Sanitation & Solid Waste',
  'Electricity & Street Lighting',
  'Water Supply & Sewerage Board',
  'Horticulture & Parks',
  'Traffic Engineering Division',
  'Health & Safety Directorate',
] as const;
const interventionCategories = [
  'Green Hedge Shield',
  'Motion Lighting',
  'Low-Cost Fencing',
  'Wall Mural & Art',
  'Civic Deterrent Signage',
] as const;

const isString = (value: unknown): value is string => typeof value === 'string' && value.trim().length > 0;
const isStringArray = (value: unknown): value is string[] =>
  Array.isArray(value) && value.every((item) => typeof item === 'string');
const isOneOf = <T extends readonly string[]>(value: unknown, values: T): value is T[number] =>
  typeof value === 'string' && values.includes(value);

const parseJson = (text: string): Record<string, unknown> => {
  const parsed: unknown = JSON.parse(text);
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    throw new Error('Gemini returned an invalid structured response.');
  }
  return parsed as Record<string, unknown>;
};

router.post(
  '/analyze-image',
  authenticate,
  requireRole('citizen'),
  validateImageType,
  imageBody,
  async (req: AuthenticatedRequest, res, next) => {
    const image = getImage(req, res);
    if (!image) return;
    const client = getClient(res);
    if (!client) return;

    try {
      const response = await client.models.generateContent({
        model: config.geminiVisionModel,
        contents: [{
          parts: [
            { text: `Inspect this photograph for a visible civic infrastructure issue. Recognize only visible evidence: potholes or damaged roads, accumulated garbage, blocked drainage, sewage overflow, waterlogging, broken streetlights, and damaged public infrastructure. Do not infer causes, dimensions, duration, injuries, or events that cannot be seen. If the image is not clear evidence of a civic issue, set issuePresent=false and category, severity, and recommendedDepartment to null. Return only JSON with these fields: issuePresent (boolean), detectedIssue (short label or "No recognizable civic issue"), category (one of ${categories.join(' | ')} or null), severity (one of ${severities.join(' | ')} or null), confidence (number 0 to 1), description (concise visible facts only), recommendedDepartment (one of ${departments.join(' | ')} or null), suggestedAction (safe municipal next step), detectedTags (string array), estimatedCostRange (indicative INR range or null), slaTargetHours (positive integer when issuePresent, otherwise 0), requiresManualReview (boolean). Require manual review if evidence is uncertain, the image is ambiguous, or no civic issue is recognizable. Severity recommendations are advisory, not a substitute for inspection.` },
            { inlineData: { mimeType: image.mimeType, data: image.data } },
          ],
        }],
        config: { responseMimeType: 'application/json' },
      });
      const result = parseJson(response.text || '');
      const issuePresent = result.issuePresent === true;
      const valid =
        typeof result.issuePresent === 'boolean' &&
        isString(result.detectedIssue) &&
        (result.category === null || isOneOf(result.category, categories)) &&
        (result.severity === null || isOneOf(result.severity, severities)) &&
        typeof result.confidence === 'number' && result.confidence >= 0 && result.confidence <= 1 &&
        isString(result.description) &&
        (result.recommendedDepartment === null || isOneOf(result.recommendedDepartment, departments)) &&
        isString(result.suggestedAction) &&
        isStringArray(result.detectedTags) &&
        (result.estimatedCostRange === null || typeof result.estimatedCostRange === 'string') &&
        typeof result.slaTargetHours === 'number' && Number.isFinite(result.slaTargetHours) &&
        typeof result.requiresManualReview === 'boolean' &&
        (issuePresent
          ? result.category !== null && result.severity !== null && result.recommendedDepartment !== null && result.slaTargetHours > 0
          : result.category === null && result.severity === null && result.recommendedDepartment === null);
      if (!valid) throw new Error('Gemini returned civic analysis outside the expected schema.');

      res.json({
        result: {
          ...result,
          requiresManualReview:
            result.requiresManualReview ||
            !issuePresent ||
            (typeof result.confidence !== 'number' || result.confidence < 0.65),
          processedAt: new Date().toISOString(),
        },
      });
    } catch (error) {
      respondWithGeminiError(
        res,
        error,
        'Gemini could not analyze this image. Please retry or complete the details manually.',
      );
    }
  },
);

router.post(
  '/spotguard',
  authenticate,
  requireRole('citizen'),
  validateImageType,
  imageBody,
  async (req: AuthenticatedRequest, res, next) => {
    const image = getImage(req, res);
    if (!image) return;
    const client = getClient(res);
    if (!client) return;

    try {
      const analysisResponse = await client.models.generateContent({
        model: config.geminiVisionModel,
        contents: [{
          parts: [
            { text: `Assess this photograph of an empty, neglected, or vulnerable public space. Separate visible conditions from potential future risks. Do not claim that dumping, crime, public urination, injury, or any other incident has occurred unless it is plainly visible in the photograph. Do not infer identities or sensitive traits. Recommend only proportionate, low-cost improvements such as suitable native plants/greenery, solar motion lighting, clear signage, bins, and low fencing only if it preserves access and does not obstruct pedestrians or emergency routes. Note that public-space work needs permission from the responsible authority; do not recommend unauthorized construction. Return only JSON with: spotName (neutral short name), detectedType (visible type of space), vulnerabilityScore (integer 0 to 100 based only on visible environmental features), vulnerabilityLevel ("Moderate Risk" | "High Risk" | "Critical Risk"), visibleConditions (string array), potentialRisks (string array, explicitly potential), aiOverview (brief, uncertainty-aware summary), interventions (1 to 5 objects with category (one of ${interventionCategories.join(' | ')}), title, description, materials (string array), implementationSteps (string array), estimatedCost (indicative range in INR, state that it varies by location), difficulty, expectedBenefit), maintenanceTip, permissionsGuidance, municipalSupportAvailable (string array). Costs must be indicative INR estimates, not quotes. When uncertain, state so and recommend site review.` },
            { inlineData: { mimeType: image.mimeType, data: image.data } },
          ],
        }],
        config: { responseMimeType: 'application/json' },
      });
      const analysis = parseJson(analysisResponse.text || '');
      const validInterventions =
        Array.isArray(analysis.interventions) &&
        analysis.interventions.length > 0 &&
        analysis.interventions.length <= 5 &&
        analysis.interventions.every((item) => {
          if (!item || typeof item !== 'object') return false;
          const intervention = item as Record<string, unknown>;
          return isOneOf(intervention.category, interventionCategories) &&
            isString(intervention.title) &&
            isString(intervention.description) &&
            isStringArray(intervention.materials) &&
            isStringArray(intervention.implementationSteps) &&
            isString(intervention.estimatedCost) &&
            /₹|INR|Rs\.?/i.test(intervention.estimatedCost) &&
            isString(intervention.difficulty) &&
            isString(intervention.expectedBenefit);
        });
      const validAnalysis =
        isString(analysis.spotName) &&
        isString(analysis.detectedType) &&
        typeof analysis.vulnerabilityScore === 'number' &&
        Number.isInteger(analysis.vulnerabilityScore) &&
        analysis.vulnerabilityScore >= 0 && analysis.vulnerabilityScore <= 100 &&
        isOneOf(analysis.vulnerabilityLevel, ['Moderate Risk', 'High Risk', 'Critical Risk'] as const) &&
        isStringArray(analysis.visibleConditions) &&
        isStringArray(analysis.potentialRisks) &&
        isString(analysis.aiOverview) &&
        validInterventions &&
        isString(analysis.maintenanceTip) &&
        isString(analysis.permissionsGuidance) &&
        isStringArray(analysis.municipalSupportAvailable);
      if (!validAnalysis) throw new Error('Gemini returned SpotGuard analysis outside the expected schema.');

      const previewResponse = await client.models.generateContent({
        model: config.geminiImageModel,
        contents: [{
          parts: [
            { text: `Create a photorealistic AI-generated conceptual improvement preview based on this exact photograph of a public space. Preserve the same camera viewpoint, perspective, walls, road, buildings, surrounding objects, and overall layout. Do not remove or relocate existing structures. Add only modest, reversible improvements that fit the visible space and maintain clear pedestrian and emergency access, such as appropriate native greenery, a bin, solar motion lighting, or permission-dependent signage. Do not depict completed public works as fact, add people, or invent an incident. This is an illustrative concept, not evidence that work has been done.` },
            { inlineData: { mimeType: image.mimeType, data: image.data } },
          ],
        }],
        config: { responseModalities: ['TEXT', 'IMAGE'] },
      });
      const generatedPart = previewResponse.candidates?.[0]?.content?.parts?.find(
        (part) => part.inlineData?.data && part.inlineData.mimeType && imageTypes.has(part.inlineData.mimeType),
      );
      if (!generatedPart?.inlineData?.data || !generatedPart.inlineData.mimeType) {
        throw new Error('Gemini did not return a generated preview image.');
      }

      const analysisId = `SG-${randomUUID().slice(0, 8).toUpperCase()}`;
      const originalImageUrl = await storeImage(req.body, image.mimeType);
      const beautifiedImageUrl = await storeImage(
        Buffer.from(generatedPart.inlineData.data, 'base64'),
        generatedPart.inlineData.mimeType,
      );
      const saved = await SpotGuardModel.create({
        analysisId,
        userId: req.auth!.userId,
        analysis,
        originalImageUrl,
        beautifiedImageUrl,
      });

      res.json({
        result: {
          id: saved.analysisId,
          ...analysis,
          originalImageUrl: saved.originalImageUrl,
          beautifiedImageUrl: saved.beautifiedImageUrl,
          createdAt: saved.createdAt.toISOString(),
          previewLabel: 'AI-generated conceptual preview — not proof of completed work',
        },
      });
    } catch (error) {
      if (error instanceof Error && error.message.includes('Persistent image storage is not configured')) {
        res.status(503).json({ error: error.message });
        return;
      }
      respondWithGeminiError(
        res,
        error,
        'SpotGuard could not analyze or generate a preview for this image. Please retry.',
      );
    }
  },
);

export default router;
