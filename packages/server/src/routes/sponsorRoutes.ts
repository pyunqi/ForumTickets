import { Router } from 'express';
import * as sponsorController from '../controllers/sponsorController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

// Public routes
router.get('/', sponsorController.getActiveSponsors);

// Admin routes
router.get('/admin', authMiddleware, sponsorController.getAllSponsors);
router.get('/admin/:id', authMiddleware, sponsorController.getSponsorById);
router.post('/admin', authMiddleware, sponsorController.createSponsor);
router.put('/admin/:id', authMiddleware, sponsorController.updateSponsor);
router.delete('/admin/:id', authMiddleware, sponsorController.deleteSponsor);

export default router;
