import { randomUUID } from 'node:crypto';
import { Router } from 'express';
import { authenticate, requireRole, type AuthenticatedRequest } from '../auth';
import { ComplaintModel } from '../models/Complaint';
import { UserModel } from '../models/User';
import { notify } from '../notifications';

const router = Router();
router.use(authenticate);
const serializeComplaint = (complaint: Record<string, unknown>) => ({ ...complaint, id: complaint.complaintId });
const categories = [
  'Roads & Pavements',
  'Garbage & Sanitation',
  'Street Lighting',
  'Water Supply & Sewage',
  'Parks & Public Spaces',
  'Traffic & Signage',
  'Public Health & Hazards',
];
const severities = ['Low', 'Medium', 'High', 'Critical'];
const isImageUrl = (value: unknown): value is string =>
  typeof value === 'string' &&
  value.length <= 14 * 1024 * 1024 &&
  (/^https:\/\//i.test(value) || /^data:image\/(?:jpeg|png|webp);base64,[A-Za-z0-9+/]+={0,2}$/.test(value));

router.get('/', async (req: AuthenticatedRequest, res, next) => {
  try {
    const filter = req.auth!.role === 'citizen'
      ? { 'citizen.id': req.auth!.userId }
      : req.auth!.role === 'officer'
        ? { assignedOfficer: req.auth!.userId }
        : {};
    const complaints = await ComplaintModel.find(filter).sort({ createdAt: -1 }).lean();
    res.json({ complaints: complaints.map((complaint) => serializeComplaint(complaint as Record<string, unknown>)) });
  } catch (error) {
    next(error);
  }
});

router.get('/:id', async (req: AuthenticatedRequest, res, next) => {
  try {
    const complaint = await ComplaintModel.findOne({ complaintId: req.params.id }).lean();
    if (!complaint) {
      res.status(404).json({ error: 'Complaint not found' });
      return;
    }
    if (req.auth!.role === 'citizen' && complaint.citizen.id !== req.auth!.userId) {
      res.status(403).json({ error: 'Insufficient permissions' });
      return;
    }
    if (req.auth!.role === 'officer' && complaint.assignedOfficer !== req.auth!.userId) {
      res.status(403).json({ error: 'This complaint is not assigned to your officer account.' });
      return;
    }
    res.json({ complaint: serializeComplaint(complaint as Record<string, unknown>) });
  } catch (error) {
    next(error);
  }
});

router.post('/', requireRole('citizen'), async (req: AuthenticatedRequest, res, next) => {
  try {
    const data = req.body;
    if (!data?.title || !data?.description || !data?.imageUrl || !data?.location) {
      res.status(400).json({ error: 'Title, description, image, and location are required' });
      return;
    }
    if (
      typeof data.title !== 'string' || data.title.trim().length < 3 || data.title.length > 160 ||
      typeof data.description !== 'string' || data.description.trim().length < 5 || data.description.length > 5000 ||
      !categories.includes(data.category) || !severities.includes(data.severity) ||
      !isImageUrl(data.imageUrl) ||
      typeof data.location?.address !== 'string' || !data.location.address.trim() ||
      !Number.isFinite(data.location.latitude) || data.location.latitude < -90 || data.location.latitude > 90 ||
      !Number.isFinite(data.location.longitude) || data.location.longitude < -180 || data.location.longitude > 180 ||
      !data.aiAnalysis || typeof data.aiAnalysis !== 'object' || Array.isArray(data.aiAnalysis)
    ) {
      res.status(400).json({ error: 'Complaint details, a valid issue image, and an accurate location are required.' });
      return;
    }
    const citizenUser = await UserModel.findById(req.auth!.userId);
    if (!citizenUser) {
      res.status(401).json({ error: 'Citizen account no longer exists.' });
      return;
    }
    const complaintId = `CIVIC-${new Date().getFullYear()}-${randomUUID().slice(0, 8).toUpperCase()}`;
    const now = new Date();
    const complaint = await ComplaintModel.create({
      title: data.title.trim(),
      category: data.category,
      severity: data.severity,
      description: data.description.trim(),
      imageUrl: data.imageUrl,
      location: data.location,
      aiAnalysis: data.aiAnalysis,
      complaintId,
      citizen: { id: citizenUser.id, name: citizenUser.name, email: citizenUser.email },
      status: 'Pending Admin Verification',
      statusTimeline: [{
        status: 'Pending Admin Verification',
        timestamp: now,
        note: 'Complaint submitted by citizen.',
        actor: req.auth!.userId,
        role: 'citizen',
      }],
    });
    await Promise.all([
      notify({
        userId: req.auth!.userId,
        targetRole: 'citizen',
        title: 'Complaint Submitted Successfully',
        message: `Your grievance ${complaintId} is queued for verification.`,
        complaintId,
        complaintTitle: complaint.title,
        type: 'submitted',
      }),
      notify({
        userId: 'admin',
        targetRole: 'admin',
        title: 'New Complaint Pending Verification',
        message: `${complaintId} is awaiting review.`,
        complaintId,
        complaintTitle: complaint.title,
        type: 'submitted',
      }),
    ]);
    res.status(201).json({ complaint: serializeComplaint(complaint.toObject() as Record<string, unknown>) });
  } catch (error) {
    next(error);
  }
});

export default router;
