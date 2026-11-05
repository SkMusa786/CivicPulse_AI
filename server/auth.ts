import bcrypt from 'bcryptjs';
import jwt, { type JwtPayload, type SignOptions } from 'jsonwebtoken';
import type { Request, Response, NextFunction } from 'express';
import { config } from './config';
import { UserModel } from './models/User';

export type AuthRole = 'citizen' | 'admin' | 'officer';
export interface AuthenticatedRequest extends Request {
  auth?: { userId: string; role: AuthRole };
}

export const signToken = (userId: string, role: AuthRole): string =>
  jwt.sign({ sub: userId, role }, config.jwtSecret, {
    expiresIn: config.jwtExpiresIn as SignOptions['expiresIn'],
  });

export const authenticate = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
  const header = req.header('authorization');
  const token = header?.startsWith('Bearer ') ? header.slice(7) : undefined;
  if (!token) {
    res.status(401).json({ error: 'Authentication required' });
    return;
  }

  try {
    const payload = jwt.verify(token, config.jwtSecret) as JwtPayload & { role?: AuthRole };
    if (typeof payload.sub !== 'string' || !payload.role || !['citizen', 'admin', 'officer'].includes(payload.role)) {
      res.status(401).json({ error: 'Invalid authentication token' });
      return;
    }
    req.auth = { userId: payload.sub, role: payload.role };
    next();
  } catch {
    res.status(401).json({ error: 'Invalid or expired authentication token' });
  }
};

export const requireRole = (...roles: AuthRole[]) =>
  (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.auth || !roles.includes(req.auth.role)) {
      res.status(403).json({ error: 'Insufficient permissions' });
      return;
    }
    next();
  };

export const verifyPassword = (password: string, hash: string): Promise<boolean> =>
  bcrypt.compare(password, hash);
