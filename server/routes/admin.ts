import { Router } from 'express';
import { authenticate, requireRole, type AuthenticatedRequest } from '../auth';
import { ComplaintModel } from '../models/Complaint';
import { notify } from '../notifications';

const router = Router();
router.use(authenticate, requireRole('admin'));
const serializeComplaint = (complaint: Record<string, unknown>) => ({ ...complaint, id: complaint.complaintId });

router.get('/complaints', async (_req, res, next) => {
  try {
    const complaints = await ComplaintModel.find().sort({ createdAt: -1 }).lean();
    res.json({ complaints: complaints.map((complaint) => serializeComplaint(complaint as Record<string, unknown>)) });
  } catch (error) {
    next(error);
  }
});

router.put('/complaints/:id/verify', async (req: AuthenticatedRequest, res, next) => {
  try {
    if (!req.body?.department) {
      res.status(400).json({ error: 'Department is required' });
      return;
    }
    const current = await ComplaintModel.findOne({ complaintId: req.params.id });
    if (!current || current.status !== 'Pending Admin Verification') {
      res.status(409).json({ error: 'Complaint is not pending verification' });
      return;
    }
    const now = new Date();
    current.status = 'Forwarded to Department';
    current.department = req.body.department;
    if (req.body.severity) current.severity = req.body.severity;
    current.statusTimeline.push(
      { status: 'Verified', timestamp: now, note: req.body.adminNotes || 'Verified by administrator.', actor: req.auth!.userId, role: 'admin' },
      { status: 'Forwarded to Department', timestamp: now, note: `Assigned to ${req.body.department}.`, actor: req.auth!.userId, role: 'admin' },
    );
    await current.save();
    await Promise.all([
      notify({ userId: current.citizen.id, targetRole: 'citizen', title: 'Complaint Verified & Forwarded', message: `Your grievance was forwarded to ${current.department}.`, complaintId: current.complaintId, complaintTitle: current.title, type: 'forwarded' }),
      notify({ userId: 'officer', targetRole: 'officer', title: 'New Work Order Assigned', message: `${current.complaintId} was assigned to ${current.department}.`, complaintId: current.complaintId, complaintTitle: current.title, type: 'forwarded' }),
    ]);
    res.json({ complaint: serializeComplaint(current.toObject() as Record<string, unknown>) });
  } catch (error) {
    next(error);
  }
});

router.put('/complaints/:id/reject', async (req: AuthenticatedRequest, res, next) => {
  try {
    if (!req.body?.rejectionReason) {
      res.status(400).json({ error: 'Rejection reason is required' });
      return;
    }
    const current = await ComplaintModel.findOne({ complaintId: req.params.id });
    if (!current || current.status !== 'Pending Admin Verification') {
      res.status(409).json({ error: 'Complaint is not pending verification' });
      return;
    }
    current.status = 'Rejected';
    current.rejectionReason = req.body.rejectionReason;
    current.statusTimeline.push({ status: 'Rejected', timestamp: new Date(), note: req.body.rejectionReason, actor: req.auth!.userId, role: 'admin' });
    await current.save();
    await notify({ userId: current.citizen.id, targetRole: 'citizen', title: 'Complaint Review Completed', message: `Your grievance was rejected: ${current.rejectionReason}`, complaintId: current.complaintId, complaintTitle: current.title, type: 'rejected' });
    res.json({ complaint: serializeComplaint(current.toObject() as Record<string, unknown>) });
  } catch (error) {
    next(error);
  }
});

export default router;
