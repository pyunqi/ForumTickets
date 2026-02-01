import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import {
  listAdmins,
  createAdmin,
  updateAdmin,
  deleteAdmin,
} from '../services/adminService';
import {
  listOrders,
  getAllOrdersForExport,
  OrderWithTicket,
} from '../services/orderService';
import {
  getAllTicketTypes,
  createTicketType,
  updateTicketType,
  deleteTicketType,
} from '../services/ticketService';

export function getAdmins(_req: AuthRequest, res: Response, next: NextFunction): void {
  try {
    const admins = listAdmins();
    res.json({ admins });
  } catch (error) {
    next(error);
  }
}

export async function createAdminHandler(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { username, password, email, role } = req.body;

    if (!username || !password) {
      res.status(400).json({ error: '请填写用户名和密码' });
      return;
    }

    if (password.length < 6) {
      res.status(400).json({ error: '密码长度不能少于6位' });
      return;
    }

    const admin = await createAdmin({ username, password, email, role });
    res.status(201).json({ admin });
  } catch (error) {
    next(error);
  }
}

export async function updateAdminHandler(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = parseInt(req.params.id, 10);
    const { username, password, email, role, is_active } = req.body;

    if (password && password.length < 6) {
      res.status(400).json({ error: '密码长度不能少于6位' });
      return;
    }

    const admin = await updateAdmin(id, { username, password, email, role, is_active });
    res.json({ admin });
  } catch (error) {
    next(error);
  }
}

export function deleteAdminHandler(req: AuthRequest, res: Response, next: NextFunction): void {
  try {
    const id = parseInt(req.params.id, 10);
    const currentUserId = req.user!.id;

    deleteAdmin(id, currentUserId);
    res.json({ message: '删除成功' });
  } catch (error) {
    next(error);
  }
}

export function getOrders(req: AuthRequest, res: Response, next: NextFunction): void {
  try {
    const page = parseInt(req.query.page as string, 10) || 1;
    const pageSize = parseInt(req.query.pageSize as string, 10) || 20;
    const status = req.query.status as string | undefined;
    const search = req.query.search as string | undefined;

    const result = listOrders({ page, pageSize, status, search });
    res.json(result);
  } catch (error) {
    next(error);
  }
}

export function exportOrders(req: AuthRequest, res: Response, next: NextFunction): void {
  try {
    const status = req.query.status as string | undefined;
    const orders = getAllOrdersForExport(status);

    const csvHeader = '订单号,客户姓名,客户邮箱,联系电话,票种,数量,总金额,状态,支付时间,创建时间\n';
    const csvRows = orders.map((o: OrderWithTicket) => {
      const statusMap: Record<string, string> = {
        pending: '待支付',
        paid: '已支付',
        cancelled: '已取消',
      };
      return [
        o.order_no,
        o.customer_name,
        o.customer_email,
        o.customer_phone || '',
        o.ticket_name,
        o.quantity,
        o.total_amount.toFixed(2),
        statusMap[o.status] || o.status,
        o.paid_at || '',
        o.created_at,
      ].join(',');
    }).join('\n');

    const csv = '\ufeff' + csvHeader + csvRows; // BOM for Excel UTF-8

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename=orders_${Date.now()}.csv`);
    res.send(csv);
  } catch (error) {
    next(error);
  }
}

// Ticket management
export function getTickets(_req: AuthRequest, res: Response, next: NextFunction): void {
  try {
    const tickets = getAllTicketTypes();
    res.json({ tickets });
  } catch (error) {
    next(error);
  }
}

export function createTicketHandler(req: AuthRequest, res: Response, next: NextFunction): void {
  try {
    const { name, description, price, quota, is_active } = req.body;

    if (!name || !name.trim()) {
      res.status(400).json({ error: '请填写票种名称' });
      return;
    }

    if (price === undefined || price < 0) {
      res.status(400).json({ error: '请填写有效的价格' });
      return;
    }

    if (quota === undefined) {
      res.status(400).json({ error: '请填写库存数量' });
      return;
    }

    const ticket = createTicketType({
      name: name.trim(),
      description: description?.trim(),
      price,
      quota,
      is_active,
    });
    res.status(201).json({ ticket });
  } catch (error) {
    next(error);
  }
}

export function updateTicketHandler(req: AuthRequest, res: Response, next: NextFunction): void {
  try {
    const id = parseInt(req.params.id, 10);
    const { name, description, price, quota, is_active } = req.body;

    if (price !== undefined && price < 0) {
      res.status(400).json({ error: '价格不能为负数' });
      return;
    }

    const ticket = updateTicketType(id, {
      name: name?.trim(),
      description: description?.trim(),
      price,
      quota,
      is_active,
    });
    res.json({ ticket });
  } catch (error) {
    next(error);
  }
}

export function deleteTicketHandler(req: AuthRequest, res: Response, next: NextFunction): void {
  try {
    const id = parseInt(req.params.id, 10);
    deleteTicketType(id);
    res.json({ message: '删除成功' });
  } catch (error) {
    next(error);
  }
}
