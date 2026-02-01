import { Router } from 'express';
import { authMiddleware, superAdminMiddleware } from '../middleware/auth';
import {
  getAdmins,
  createAdminHandler,
  updateAdminHandler,
  deleteAdminHandler,
  getOrders,
  exportOrders,
  getTickets,
  createTicketHandler,
  updateTicketHandler,
  deleteTicketHandler,
} from '../controllers/adminController';

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

// Order management (all admins)
router.get('/orders', getOrders);
router.get('/orders/export', exportOrders);

export default router;
