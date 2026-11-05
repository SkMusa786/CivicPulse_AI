import { Router } from 'express';
import { authenticate, requireRole, type AuthenticatedRequest } from '../auth';
import { ComplaintModel } from '../models/Complaint';
import { notify } from '../notifications';

const router = Router();
router.use(authenticate);
const serializeComplaint = (complaint: Record<string, unknown>) => ({ ...complaint, id: complaint.complaintId });

router.get('/', async (req: AuthenticatedRequest, res, next) => {
  try {
    const filter = req.auth!.role === 'citizen' ? { 'citizen.id': req.auth!.userId } : {};
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
    const complaintId = `CIVIC-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const now = new Date();
    const complaint = await ComplaintModel.create({
      ...data,
      complaintId,
      citizen: { ...data.citizen, id: req.auth!.userId },
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
