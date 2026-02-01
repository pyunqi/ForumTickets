import { Request, Response, NextFunction } from 'express';
import { verifyToken, JwtPayload } from '../utils/jwt';

export interface AuthRequest extends Request {
  user?: JwtPayload;
}

export function authMiddleware(req: AuthRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: '未授权访问' });
    return;
  }

  const token = authHeader.slice(7);

  try {
    const payload = verifyToken(token);
    req.user = payload;
    next();
  } catch {
    res.status(401).json({ error: 'Token无效或已过期' });
  }
}

export function superAdminMiddleware(req: AuthRequest, res: Response, next: NextFunction): void {
  if (req.user?.role !== 'super_admin') {
    res.status(403).json({ error: '需要超级管理员权限' });
    return;
  }
  next();
}
