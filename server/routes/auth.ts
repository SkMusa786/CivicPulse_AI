import { Router } from 'express';
import { UserModel } from '../models/User';
import { authenticate, signToken, verifyPassword, type AuthenticatedRequest } from '../auth';

const router = Router();

router.post('/login', async (req, res, next) => {
  try {
    const email = typeof req.body?.email === 'string' ? req.body.email.trim().toLowerCase() : '';
    const password = typeof req.body?.password === 'string' ? req.body.password : '';
    if (!email || !password) {
      res.status(400).json({ error: 'Email and password are required' });
      return;
    }
    const user = await UserModel.findOne({ email }).select('+passwordHash');
    if (!user || !(await verifyPassword(password, user.passwordHash))) {
      res.status(401).json({ error: 'Invalid email or password' });
      return;
    }
    res.json({
      token: signToken(user.id, user.role),
      user: { id: user.id, name: user.name, email: user.email, role: user.role, department: user.department },
    });
  } catch (error) {
    next(error);
  }
});

router.get('/me', authenticate, async (req: AuthenticatedRequest, res, next) => {
  try {
    const user = await UserModel.findById(req.auth!.userId);
    if (!user) {
      res.status(401).json({ error: 'User no longer exists' });
      return;
    }
    res.json({ user: { id: user.id, name: user.name, email: user.email, role: user.role, department: user.department } });
  } catch (error) {
    next(error);
  }
});

export default router;
