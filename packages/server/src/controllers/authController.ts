import { Response, NextFunction } from 'express';
import { login, getAdminById } from '../services/adminService';
import { AuthRequest } from '../middleware/auth';

export async function loginHandler(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      res.status(400).json({ error: '请填写用户名和密码' });
      return;
    }

    const result = await login(username, password);
    res.json(result);
  } catch (error) {
    next(error);
  }
}

export function getMe(req: AuthRequest, res: Response, next: NextFunction): void {
  try {
    if (!req.user) {
      res.status(401).json({ error: '未授权' });
      return;
    }

    const admin = getAdminById(req.user.id);
    if (!admin) {
      res.status(404).json({ error: '用户不存在' });
      return;
    }

    res.json({ admin });
  } catch (error) {
    next(error);
  }
}
