import bcrypt from 'bcryptjs';
import { Router } from 'express';
import { authenticate, requireRole, type AuthenticatedRequest } from '../auth';
import { ComplaintModel } from '../models/Complaint';
import { UserModel } from '../models/User';
import { notify } from '../notifications';

const router = Router();
router.use(authenticate, requireRole('admin'));
const serializeComplaint = (complaint: Record<string, unknown>) => ({ ...complaint, id: complaint.complaintId });

router.get('/users', async (_req, res, next) => {
  try {
    const users = await UserModel.find().select('name email role department phone ward').sort({ createdAt: -1 }).lean();
    res.json({
      users: users.map((user) => ({
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        phone: user.phone,
        ward: user.ward,
      })),
    });
  } catch (error) {
    next(error);
  }
});

router.post('/officers', async (req, res, next) => {
  try {
    const { name, email, password, department } = req.body || {};
    const departments = [
      'Public Works Department',
      'Sanitation & Solid Waste',
      'Electricity & Street Lighting',
      'Water Supply & Sewerage Board',
      'Horticulture & Parks',
      'Traffic Engineering Division',
      'Health & Safety Directorate',
    ];
    if (
      typeof name !== 'string' || name.trim().length < 2 || name.length > 100 ||
      typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) ||
      typeof password !== 'string' || password.length < 8 || password.length > 128 ||
      typeof department !== 'string' || !departments.includes(department)
    ) {
      res.status(400).json({ error: 'Enter a valid officer name, email, department, and password (8–128 characters).' });
      return;
    }
    if (await UserModel.exists({ email: email.trim().toLowerCase() })) {
      res.status(409).json({ error: 'An account with this email already exists.' });
      return;
    }
    let officer;
    try {
      officer = await UserModel.create({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        passwordHash: await bcrypt.hash(password, 12),
        role: 'officer',
        department,
      });
    } catch (error) {
      if (error && typeof error === 'object' && 'code' in error && error.code === 11000) {
        res.status(409).json({ error: 'An account with this email already exists.' });
        return;
      }
      throw error;
    }
    res.status(201).json({
      user: {
        id: officer.id,
        name: officer.name,
        email: officer.email,
        role: officer.role,
        department: officer.department,
      },
    });
  } catch (error) {
    next(error);
  }
});

router.get('/officers', async (_req, res, next) => {
  try {
    const officers = await UserModel.find({ role: 'officer' }).select('name email department').sort({ name: 1 }).lean();
    res.json({
      officers: officers.map((officer) => ({
        id: officer._id.toString(),
        name: officer.name,
        email: officer.email,
        department: officer.department,
      })),
    });
  } catch (error) {
    next(error);
  }
});

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
    const { department, severity, adminNotes } = req.body || {};
    if (
      typeof department !== 'string' ||
      ![
        'Public Works Department',
        'Sanitation & Solid Waste',
        'Electricity & Street Lighting',
        'Water Supply & Sewerage Board',
        'Horticulture & Parks',
        'Traffic Engineering Division',
        'Health & Safety Directorate',
      ].includes(department)
    ) {
      res.status(400).json({ error: 'Department is required' });
      return;
    }
    if (severity !== undefined && !['Low', 'Medium', 'High', 'Critical'].includes(severity)) {
      res.status(400).json({ error: 'Select a valid complaint severity.' });
      return;
    }
    if (adminNotes !== undefined && (typeof adminNotes !== 'string' || adminNotes.length > 2000)) {
      res.status(400).json({ error: 'Supervisor notes must be 2000 characters or fewer.' });
      return;
    }
    const officer = await UserModel.findOne({ role: 'officer', department });
    if (!officer) {
      res.status(409).json({ error: `No officer is assigned to ${department}. Assign an officer account before dispatching work.` });
      return;
    }
    const current = await ComplaintModel.findOne({ complaintId: req.params.id });
    if (!current || current.status !== 'Pending Admin Verification') {
      res.status(409).json({ error: 'Complaint is not pending verification' });
      return;
    }
    const now = new Date();
    current.status = 'Forwarded to Department';
    current.department = department;
    current.assignedOfficer = officer.id;
    current.set('assignedAt', now);
    if (severity) current.severity = severity;
    current.statusTimeline.push(
      { status: 'Verified', timestamp: now, note: adminNotes || 'Verified by administrator.', actor: req.auth!.userId, role: 'admin' },
      { status: 'Forwarded to Department', timestamp: now, note: `Assigned to ${department}.`, actor: req.auth!.userId, role: 'admin' },
    );
    await current.save();
    await Promise.all([
      notify({ userId: current.citizen.id, targetRole: 'citizen', title: 'Complaint Verified & Forwarded', message: `Your grievance was forwarded to ${current.department}.`, complaintId: current.complaintId, complaintTitle: current.title, type: 'forwarded' }),
      notify({ userId: officer.id, targetRole: 'officer', title: 'New Work Order Assigned', message: `${current.complaintId} was assigned to ${current.department}.`, complaintId: current.complaintId, complaintTitle: current.title, type: 'forwarded' }),
    ]);
    res.json({ complaint: serializeComplaint(current.toObject() as Record<string, unknown>) });
  } catch (error) {
    next(error);
  }
});

router.put('/complaints/:id/reject', async (req: AuthenticatedRequest, res, next) => {
  try {
    if (typeof req.body?.rejectionReason !== 'string' || !req.body.rejectionReason.trim() || req.body.rejectionReason.length > 2000) {
      res.status(400).json({ error: 'Rejection reason is required' });
      return;
    }
    const current = await ComplaintModel.findOne({ complaintId: req.params.id });
    if (!current || current.status !== 'Pending Admin Verification') {
      res.status(409).json({ error: 'Complaint is not pending verification' });
      return;
    }
    current.status = 'Rejected';
    current.rejectionReason = req.body.rejectionReason.trim();
    current.statusTimeline.push({ status: 'Rejected', timestamp: new Date(), note: req.body.rejectionReason.trim(), actor: req.auth!.userId, role: 'admin' });
    await current.save();
    await notify({ userId: current.citizen.id, targetRole: 'citizen', title: 'Complaint Review Completed', message: `Your grievance was rejected: ${current.rejectionReason}`, complaintId: current.complaintId, complaintTitle: current.title, type: 'rejected' });
    res.json({ complaint: serializeComplaint(current.toObject() as Record<string, unknown>) });
  } catch (error) {
    next(error);
  }
});

export default router;
