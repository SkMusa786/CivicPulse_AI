import { Router } from 'express';
import { authenticate, requireRole, type AuthenticatedRequest } from '../auth';
import { ComplaintModel } from '../models/Complaint';
import { UserModel } from '../models/User';
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
    const officer = await UserModel.findById(req.auth!.userId);
    if (!officer || officer.role !== 'officer' || !officer.department) {
      res.status(403).json({ error: 'Your officer account must have an assigned department.' });
      return;
    }
    if (typeof req.query.department === 'string' && req.query.department !== officer.department) {
      res.status(403).json({ error: 'You cannot view another department’s work orders.' });
      return;
    }
    const filter = { assignedOfficer: officer.id, department: officer.department };
    const complaints = await ComplaintModel.find(filter).sort({ createdAt: -1 }).lean();
    res.json({ complaints: complaints.map((complaint) => serializeComplaint(complaint as Record<string, unknown>)) });
  } catch (error) {
    next(error);
  }
});

router.put('/complaints/:id/status', async (req: AuthenticatedRequest, res, next) => {
  try {
    const { status, note } = req.body || {};
    if (status !== 'In Progress' || typeof note !== 'string' || !note.trim() || note.length > 2000) {
      res.status(400).json({ error: 'A valid In Progress status and work note (up to 2000 characters) are required.' });
      return;
    }
    const officer = await UserModel.findById(req.auth!.userId);
    const current = await ComplaintModel.findOne({
      complaintId: req.params.id,
      assignedOfficer: req.auth!.userId,
    });
    if (!officer?.department || !current || current.department !== officer.department) {
      res.status(404).json({ error: 'Assigned complaint not found' });
      return;
    }
    if (!allowedTransitions[current.status]?.includes(status)) {
      res.status(409).json({ error: `Invalid status transition from ${current.status} to ${status}` });
      return;
    }
    current.status = status;
    current.statusTimeline.push({ status, timestamp: new Date(), note: note.trim(), actor: req.auth!.userId, role: 'officer' });
    await current.save();
    await notify({ userId: current.citizen.id, targetRole: 'citizen', title: `Work Status: ${status}`, message: note.trim(), complaintId: current.complaintId, complaintTitle: current.title, type: 'in_progress' });
    res.json({ complaint: serializeComplaint(current.toObject() as Record<string, unknown>) });
  } catch (error) {
    next(error);
  }
});

router.post('/complaints/:id/proof', async (req: AuthenticatedRequest, res, next) => {
  try {
    const proof = req.body;
    if (
      typeof proof?.afterImageUrl !== 'string' ||
      proof.afterImageUrl.length > 14 * 1024 * 1024 ||
      !(/^https:\/\//i.test(proof.afterImageUrl) || /^data:image\/(?:jpeg|png|webp);base64,[A-Za-z0-9+/]+={0,2}$/.test(proof.afterImageUrl)) ||
      typeof proof.workDescription !== 'string' || !proof.workDescription.trim() || proof.workDescription.length > 5000 ||
      (proof.materialsUsed !== undefined && (typeof proof.materialsUsed !== 'string' || proof.materialsUsed.length > 2000)) ||
      (proof.workOrderNumber !== undefined && (typeof proof.workOrderNumber !== 'string' || proof.workOrderNumber.length > 100))
    ) {
      res.status(400).json({ error: 'A valid after photograph and work description are required.' });
      return;
    }
    const officer = await UserModel.findById(req.auth!.userId);
    const current = await ComplaintModel.findOne({
      complaintId: req.params.id,
      assignedOfficer: req.auth!.userId,
    });
    if (!officer?.department || !current || current.department !== officer.department || current.status !== 'In Progress') {
      res.status(409).json({ error: 'Complaint must be in progress before proof can be submitted' });
      return;
    }
    current.status = 'Resolved';
    current.resolutionProof = {
      beforeImageUrl: current.imageUrl,
      afterImageUrl: proof.afterImageUrl,
      workDescription: proof.workDescription.trim(),
      completedDate: typeof proof.completedDate === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(proof.completedDate)
        ? proof.completedDate
        : new Date().toISOString().slice(0, 10),
      officerName: officer.name,
      department: officer.department,
      materialsUsed: typeof proof.materialsUsed === 'string' ? proof.materialsUsed.trim() : '',
      workOrderNumber: typeof proof.workOrderNumber === 'string' ? proof.workOrderNumber.trim() : '',
    };
    current.statusTimeline.push({ status: 'Resolved', timestamp: new Date(), note: proof.workDescription.trim(), actor: req.auth!.userId, role: 'officer' });
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
