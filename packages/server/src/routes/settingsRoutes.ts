import { Router } from 'express';
import * as settingsController from '../controllers/settingsController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

// Public: Get enabled payment methods
router.get('/payment-methods', settingsController.getEnabledPaymentMethods);

// Admin: Get all payment settings
router.get('/admin/payment', authMiddleware, settingsController.getPaymentSettings);

// Admin: Update payment settings
router.put('/admin/payment', authMiddleware, settingsController.updatePaymentSettings);

export default router;
