import { Router } from 'express';
import { authMiddleware, superAdminMiddleware } from '../middleware/auth';
import {
  getAdmins,
  createAdminHandler,
  updateAdminHandler,
  deleteAdminHandler,
  getOrders,
  exportOrders,
  confirmPaymentHandler,
  verifyTransferHandler,
  getTickets,
  createTicketHandler,
  updateTicketHandler,
  deleteTicketHandler,
} from '../controllers/adminController';
import * as conferenceController from '../controllers/conferenceController';

const router = Router();

// All admin routes require authentication
router.use(authMiddleware);

// Admin management (super_admin only)
router.get('/admins', getAdmins);
router.post('/admins', superAdminMiddleware, createAdminHandler);
router.put('/admins/:id', superAdminMiddleware, updateAdminHandler);
router.delete('/admins/:id', superAdminMiddleware, deleteAdminHandler);

// Ticket management (super_admin only)
router.get('/tickets', getTickets);
router.post('/tickets', superAdminMiddleware, createTicketHandler);
router.put('/tickets/:id', superAdminMiddleware, updateTicketHandler);
router.delete('/tickets/:id', superAdminMiddleware, deleteTicketHandler);

// Conference management (super_admin only)
router.get('/conferences', conferenceController.list);
router.get('/conferences/:id', conferenceController.getById);
router.post('/conferences', superAdminMiddleware, conferenceController.create);
router.put('/conferences/:id', superAdminMiddleware, conferenceController.update);
router.delete('/conferences/:id', superAdminMiddleware, conferenceController.remove);
router.post('/conferences/:id/activate', superAdminMiddleware, conferenceController.activate);

// Order management (all admins)
router.get('/orders', getOrders);
router.get('/orders/export', exportOrders);
router.post('/orders/:orderNo/confirm-payment', confirmPaymentHandler);
router.post('/orders/:orderNo/verify-transfer', verifyTransferHandler);

export default router;
