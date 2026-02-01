import { getDatabase } from '../database/connection';
import { generateOrderNo } from '../utils/orderNo';
import { getTicketTypeById, incrementSoldCount, checkTicketAvailability } from './ticketService';

export interface Order {
  id: number;
  order_no: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string | null;
  ticket_type_id: number;
  quantity: number;
  total_amount: number;
  status: 'pending' | 'paid' | 'cancelled';
  paid_at: string | null;
  created_at: string;
}

export interface OrderWithTicket extends Order {
  ticket_name: string;
  ticket_price: number;
}

export interface CreateOrderParams {
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  ticketTypeId: number;
  quantity: number;
}

export function createOrder(params: CreateOrderParams): Order {
  const db = getDatabase();
  const ticket = getTicketTypeById(params.ticketTypeId);

  if (!ticket) {
    throw Object.assign(new Error('票种不存在'), { statusCode: 400 });
  }

  if (!checkTicketAvailability(params.ticketTypeId, params.quantity)) {
    throw Object.assign(new Error('票已售罄或库存不足'), { statusCode: 400 });
  }

  const orderNo = generateOrderNo();
  const totalAmount = ticket.price * params.quantity;

  const result = db.prepare(`
    INSERT INTO orders (order_no, customer_name, customer_email, customer_phone, ticket_type_id, quantity, total_amount)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(
    orderNo,
    params.customerName,
    params.customerEmail,
    params.customerPhone || null,
    params.ticketTypeId,
    params.quantity,
    totalAmount
  );

  incrementSoldCount(params.ticketTypeId, params.quantity);

  return db.prepare('SELECT * FROM orders WHERE id = ?').get(result.lastInsertRowid) as Order;
}

export function getOrderByNo(orderNo: string): OrderWithTicket | undefined {
  const db = getDatabase();
  return db.prepare(`
    SELECT o.*, t.name as ticket_name, t.price as ticket_price
    FROM orders o
    JOIN ticket_types t ON o.ticket_type_id = t.id
    WHERE o.order_no = ?
  `).get(orderNo) as OrderWithTicket | undefined;
}

export function payOrder(orderNo: string): Order {
  const db = getDatabase();
  const order = getOrderByNo(orderNo);

  if (!order) {
    throw Object.assign(new Error('订单不存在'), { statusCode: 404 });
  }

  if (order.status === 'paid') {
    throw Object.assign(new Error('订单已支付'), { statusCode: 400 });
  }

  if (order.status === 'cancelled') {
    throw Object.assign(new Error('订单已取消'), { statusCode: 400 });
  }

  db.prepare(`
    UPDATE orders
    SET status = 'paid', paid_at = CURRENT_TIMESTAMP
    WHERE order_no = ?
  `).run(orderNo);

  return db.prepare('SELECT * FROM orders WHERE order_no = ?').get(orderNo) as Order;
}

export interface ListOrdersParams {
  page: number;
  pageSize: number;
  status?: string;
  search?: string;
}

export interface ListOrdersResult {
  orders: OrderWithTicket[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export function listOrders(params: ListOrdersParams): ListOrdersResult {
  const db = getDatabase();
  const { page, pageSize, status, search } = params;
  const offset = (page - 1) * pageSize;

  let whereClause = '1=1';
  const queryParams: (string | number)[] = [];

  if (status) {
    whereClause += ' AND o.status = ?';
    queryParams.push(status);
  }

  if (search) {
    whereClause += ' AND (o.customer_name LIKE ? OR o.customer_email LIKE ? OR o.order_no LIKE ?)';
    const searchPattern = `%${search}%`;
    queryParams.push(searchPattern, searchPattern, searchPattern);
  }

  const countResult = db.prepare(`
    SELECT COUNT(*) as count FROM orders o WHERE ${whereClause}
  `).get(...queryParams) as { count: number };

  const orders = db.prepare(`
    SELECT o.*, t.name as ticket_name, t.price as ticket_price
    FROM orders o
    JOIN ticket_types t ON o.ticket_type_id = t.id
    WHERE ${whereClause}
    ORDER BY o.created_at DESC
    LIMIT ? OFFSET ?
  `).all(...queryParams, pageSize, offset) as OrderWithTicket[];

  return {
    orders,
    total: countResult.count,
    page,
    pageSize,
    totalPages: Math.ceil(countResult.count / pageSize),
  };
}

export function getAllOrdersForExport(status?: string): OrderWithTicket[] {
  const db = getDatabase();

  let query = `
    SELECT o.*, t.name as ticket_name, t.price as ticket_price
    FROM orders o
    JOIN ticket_types t ON o.ticket_type_id = t.id
  `;

  if (status) {
    query += ' WHERE o.status = ?';
    return db.prepare(query + ' ORDER BY o.created_at DESC').all(status) as OrderWithTicket[];
  }

  return db.prepare(query + ' ORDER BY o.created_at DESC').all() as OrderWithTicket[];
}
