import { Router } from 'express';
import express from 'express';
import type { Response } from 'express';
import { authenticate, type AuthenticatedRequest } from '../auth';
import { storeImage } from '../imageStorage';

const router = Router();
const imageTypes = new Set(['image/jpeg', 'image/png', 'image/webp']);

const contentType = (req: AuthenticatedRequest): string =>
  (req.header('content-type') || '').split(';', 1)[0].trim().toLowerCase();

const imageBody = express.raw({
  type: (req) => imageTypes.has((req.headers['content-type'] || '').split(';', 1)[0].trim().toLowerCase()),
  limit: '10mb',
});

const hasValidSignature = (buffer: Buffer, mimeType: string): boolean => {
  if (mimeType === 'image/jpeg') return buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
  if (mimeType === 'image/png') return buffer.length >= 8 && buffer.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));
  return buffer.length >= 12 && buffer.toString('ascii', 0, 4) === 'RIFF' && buffer.toString('ascii', 8, 12) === 'WEBP';
};

router.post('/image', authenticate, imageBody, async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const mimeType = contentType(req);
    if (!imageTypes.has(mimeType)) {
      res.status(415).json({ error: 'Upload a JPEG, PNG, or WEBP image.' });
      return;
    }
    if (!Buffer.isBuffer(req.body) || req.body.length === 0) {
      res.status(400).json({ error: 'An image upload is required.' });
      return;
    }
    if (!hasValidSignature(req.body, mimeType)) {
      res.status(415).json({ error: 'The uploaded file does not match its declared image type.' });
      return;
    }
    res.status(201).json({ imageUrl: await storeImage(req.body, mimeType) });
  } catch (error) {
    if (error instanceof Error && error.message.includes('Persistent image storage is not configured')) {
      res.status(503).json({ error: error.message });
      return;
    }
    if (error instanceof Error && error.message.includes('Cloudinary')) {
      res.status(502).json({ error: 'Image storage is unavailable. Please try again later.' });
      return;
    }
    next(error);
  }
});

export default router;
