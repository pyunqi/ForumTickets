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

// Public: Get page visibility settings
router.get('/page-visibility', settingsController.getPageVisibility);

// Admin: Update page visibility settings
router.put('/admin/page-visibility', authMiddleware, settingsController.updatePageVisibility);

// Public: Get homepage content
router.get('/homepage-content', settingsController.getHomepageContent);

// Admin: Update homepage content
router.put('/admin/homepage-content', authMiddleware, settingsController.updateHomepageContent);

export default router;
