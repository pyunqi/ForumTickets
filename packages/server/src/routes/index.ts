import { Router } from 'express';
import ticketRoutes from './ticketRoutes';
import orderRoutes from './orderRoutes';
import authRoutes from './authRoutes';
import adminRoutes from './adminRoutes';

const router = Router();

router.use('/tickets', ticketRoutes);
router.use('/orders', orderRoutes);
router.use('/auth', authRoutes);
router.use('/admin', adminRoutes);

export default router;
