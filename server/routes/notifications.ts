import { Router } from 'express';
import { authenticate, type AuthenticatedRequest } from '../auth';
import { NotificationModel } from '../models/Notification';

const router = Router();
router.use(authenticate);

router.get('/', async (req: AuthenticatedRequest, res, next) => {
  try {
    const notifications = await NotificationModel.find({
      $or: [{ userId: req.auth!.userId }, { targetRole: req.auth!.role }, { targetRole: 'all' }],
    }).sort({ createdAt: -1 }).lean();
    res.json({ notifications: notifications.map((notification) => ({ ...notification, id: notification._id.toString() })) });
  } catch (error) {
    next(error);
  }
});

router.patch('/:id/read', async (req: AuthenticatedRequest, res, next) => {
  try {
    const notification = await NotificationModel.findOneAndUpdate(
      { _id: req.params.id, userId: req.auth!.userId },
      { $set: { read: true } },
      { new: true },
    );
    if (!notification) {
      res.status(404).json({ error: 'Notification not found' });
      return;
    }
    res.json({ notification });
  } catch (error) {
    next(error);
  }
});

export default router;
