import { Router } from 'express';
import ticketRoutes from './ticketRoutes';
import orderRoutes from './orderRoutes';
import authRoutes from './authRoutes';
import adminRoutes from './adminRoutes';
import settingsRoutes from './settingsRoutes';
import sponsorRoutes from './sponsorRoutes';
import conferenceRoutes from './conferenceRoutes';

const router = Router();

router.use('/tickets', ticketRoutes);
router.use('/orders', orderRoutes);
router.use('/auth', authRoutes);
router.use('/admin', adminRoutes);
router.use('/settings', settingsRoutes);
router.use('/sponsors', sponsorRoutes);
router.use('/conferences', conferenceRoutes);

export default router;
