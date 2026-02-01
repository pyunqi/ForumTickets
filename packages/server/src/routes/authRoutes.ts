import { Router } from 'express';
import { loginHandler, getMe } from '../controllers/authController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.post('/login', loginHandler);
router.get('/me', authMiddleware, getMe);

export default router;
