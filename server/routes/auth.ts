import bcrypt from 'bcryptjs';
import { Router } from 'express';
import { UserModel } from '../models/User';
import { authenticate, signToken, verifyPassword, type AuthenticatedRequest } from '../auth';

const router = Router();

router.post('/register', async (req, res, next) => {
  try {
    const name = typeof req.body?.name === 'string' ? req.body.name.trim() : '';
    const email = typeof req.body?.email === 'string' ? req.body.email.trim().toLowerCase() : '';
    const password = typeof req.body?.password === 'string' ? req.body.password : '';
    const phone = typeof req.body?.phone === 'string' ? req.body.phone.trim() : '';
    const ward = typeof req.body?.ward === 'string' ? req.body.ward.trim() : '';
    if (
      name.length < 2 || name.length > 100 ||
      email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
      phone.length > 40 || ward.length > 120
    ) {
      res.status(400).json({ error: 'Enter a valid name and email address.' });
      return;
    }
    if (password.length < 8 || password.length > 128) {
      res.status(400).json({ error: 'Password must be between 8 and 128 characters.' });
      return;
    }
    if (await UserModel.exists({ email })) {
      res.status(409).json({ error: 'An account with this email already exists.' });
      return;
    }
    let user;
    try {
      user = await UserModel.create({
        name,
        email,
        passwordHash: await bcrypt.hash(password, 12),
        role: 'citizen',
        phone,
        ward,
      });
    } catch (error) {
      if (error && typeof error === 'object' && 'code' in error && error.code === 11000) {
        res.status(409).json({ error: 'An account with this email already exists.' });
        return;
      }
      throw error;
    }
    res.status(201).json({
      token: signToken(user.id, user.role),
      user: { id: user.id, name: user.name, email: user.email, role: user.role, phone: user.phone, ward: user.ward },
    });
  } catch (error) {
    next(error);
  }
});

router.post('/login', async (req, res, next) => {
  try {
    const email = typeof req.body?.email === 'string' ? req.body.email.trim().toLowerCase() : '';
    const password = typeof req.body?.password === 'string' ? req.body.password : '';
    if (!email || email.length > 254 || !password || password.length > 128) {
      res.status(400).json({ error: 'Enter a valid email address and password (up to 128 characters).' });
      return;
    }
    const user = await UserModel.findOne({ email }).select('+passwordHash');
    if (!user || !(await verifyPassword(password, user.passwordHash))) {
      res.status(401).json({ error: 'Invalid email or password' });
      return;
    }
    res.json({
      token: signToken(user.id, user.role),
      user: { id: user.id, name: user.name, email: user.email, role: user.role, department: user.department, phone: user.phone, ward: user.ward },
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
    res.json({ user: { id: user.id, name: user.name, email: user.email, role: user.role, department: user.department, phone: user.phone, ward: user.ward } });
  } catch (error) {
    next(error);
  }
});

export default router;
