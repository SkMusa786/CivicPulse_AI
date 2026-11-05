import { Router } from 'express';
import { authenticate, requireRole, type AuthenticatedRequest } from '../auth';
import { ComplaintModel } from '../models/Complaint';
import { notify } from '../notifications';

const router = Router();
router.use(authenticate, requireRole('officer'));
const serializeComplaint = (complaint: Record<string, unknown>) => ({ ...complaint, id: complaint.complaintId });
const allowedTransitions: Record<string, string[]> = {
  'Forwarded to Department': ['In Progress'],
  'In Progress': ['Resolved'],
};

router.get('/complaints', async (req: AuthenticatedRequest, res, next) => {
  try {
    const department = typeof req.query.department === 'string' ? req.query.department : undefined;
    const filter = department ? { department } : { department: { $exists: true } };
    const complaints = await ComplaintModel.find(filter).sort({ createdAt: -1 }).lean();
    res.json({ complaints: complaints.map((complaint) => serializeComplaint(complaint as Record<string, unknown>)) });
  } catch (error) {
    next(error);
  }
});

router.put('/complaints/:id/status', async (req: AuthenticatedRequest, res, next) => {
  try {
    const { status, note } = req.body || {};
    if (!status || !note) {
      res.status(400).json({ error: 'Status and note are required' });
      return;
    }
    const current = await ComplaintModel.findOne({ complaintId: req.params.id });
    if (!current || !current.department) {
      res.status(404).json({ error: 'Assigned complaint not found' });
      return;
    }
    if (!allowedTransitions[current.status]?.includes(status)) {
      res.status(409).json({ error: `Invalid status transition from ${current.status} to ${status}` });
      return;
    }
    current.status = status;
    current.assignedOfficer = req.auth!.userId;
    current.statusTimeline.push({ status, timestamp: new Date(), note, actor: req.auth!.userId, role: 'officer' });
    await current.save();
    await notify({ userId: current.citizen.id, targetRole: 'citizen', title: `Work Status: ${status}`, message: note, complaintId: current.complaintId, complaintTitle: current.title, type: status === 'In Progress' ? 'in_progress' : 'forwarded' });
    res.json({ complaint: serializeComplaint(current.toObject() as Record<string, unknown>) });
  } catch (error) {
    next(error);
  }
});

router.post('/complaints/:id/proof', async (req: AuthenticatedRequest, res, next) => {
  try {
    const proof = req.body;
    if (!proof?.afterImageUrl || !proof?.workDescription) {
      res.status(400).json({ error: 'After image and work description are required' });
      return;
    }
    const current = await ComplaintModel.findOne({ complaintId: req.params.id });
    if (!current || current.status !== 'In Progress') {
      res.status(409).json({ error: 'Complaint must be in progress before proof can be submitted' });
      return;
    }
    current.status = 'Resolved';
    current.assignedOfficer = req.auth!.userId;
    current.resolutionProof = proof;
    current.statusTimeline.push({ status: 'Resolved', timestamp: new Date(), note: proof.workDescription, actor: req.auth!.userId, role: 'officer' });
    await current.save();
    await Promise.all([
      notify({ userId: current.citizen.id, targetRole: 'citizen', title: 'Resolution Proof Delivered', message: `Resolution proof is available for ${current.complaintId}.`, complaintId: current.complaintId, complaintTitle: current.title, type: 'resolved' }),
      notify({ userId: 'admin', targetRole: 'admin', title: 'Complaint Resolved', message: `${current.complaintId} was resolved with proof.`, complaintId: current.complaintId, complaintTitle: current.title, type: 'resolved' }),
    ]);
    res.json({ complaint: serializeComplaint(current.toObject() as Record<string, unknown>) });
  } catch (error) {
    next(error);
  }
});

export default router;
