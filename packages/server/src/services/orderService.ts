import { getDatabase } from '../database/connection';
import { generateOrderNo } from '../utils/orderNo';
import { getTicketTypeById, incrementSoldCount, checkTicketAvailability, TicketType } from './ticketService';
import { sendOrderConfirmationEmail } from './emailService';

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
  attendees_info?: string;
  payment_method?: string;
  payer_bank_last4?: string;
  verified_by?: string;
}

export interface OrderWithTicket extends Order {
  ticket_name: string;
  ticket_price: number;
}

export interface AttendeeInfo {
  name: string;
  ticketTypeId: number;
  ticketName?: string;
  ticketPrice?: number;
}

export interface CreateOrderParams {
  customerEmail: string;
  customerPhone?: string;
  attendees: AttendeeInfo[];
}

// Legacy params for backward compatibility
export interface CreateOrderParamsLegacy {
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  ticketTypeId: number;
  quantity: number;
}

export function createOrder(params: CreateOrderParams | CreateOrderParamsLegacy): Order {
  const db = getDatabase();

  // Handle legacy format
  if ('customerName' in params && 'ticketTypeId' in params) {
    const legacyParams = params as CreateOrderParamsLegacy;
    const ticket = getTicketTypeById(legacyParams.ticketTypeId);

    if (!ticket) {
      throw Object.assign(new Error('票种不存在'), { statusCode: 400 });
    }

    if (!checkTicketAvailability(legacyParams.ticketTypeId, legacyParams.quantity)) {
      throw Object.assign(new Error('票已售罄或库存不足'), { statusCode: 400 });
    }

    const orderNo = generateOrderNo();
    const totalAmount = ticket.price * legacyParams.quantity;

    const result = db.prepare(`
      INSERT INTO orders (order_no, customer_name, customer_email, customer_phone, ticket_type_id, quantity, total_amount)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(
      orderNo,
      legacyParams.customerName,
      legacyParams.customerEmail,
      legacyParams.customerPhone || null,
      legacyParams.ticketTypeId,
      legacyParams.quantity,
      totalAmount
    );

    incrementSoldCount(legacyParams.ticketTypeId, legacyParams.quantity);

    return db.prepare('SELECT * FROM orders WHERE id = ?').get(result.lastInsertRowid) as Order;
  }

  // New format with attendees
  const newParams = params as CreateOrderParams;
  const { customerEmail, customerPhone, attendees } = newParams;

  if (!attendees || attendees.length === 0) {
    throw Object.assign(new Error('请添加参会人'), { statusCode: 400 });
  }

  if (attendees.length > 5) {
    throw Object.assign(new Error('一次最多购买5张票'), { statusCode: 400 });
  }

  // Validate all tickets and calculate total
  let totalAmount = 0;
  const ticketCounts: Record<number, number> = {};
  const attendeesWithTicket: AttendeeInfo[] = [];

  for (const attendee of attendees) {
    const ticket = getTicketTypeById(attendee.ticketTypeId);
    if (!ticket) {
      throw Object.assign(new Error(`票种不存在: ${attendee.ticketTypeId}`), { statusCode: 400 });
    }

    ticketCounts[attendee.ticketTypeId] = (ticketCounts[attendee.ticketTypeId] || 0) + 1;
    totalAmount += ticket.price;
    attendeesWithTicket.push({
      ...attendee,
      ticketName: ticket.name,
      ticketPrice: ticket.price,
    });
  }

  // Check availability for each ticket type
  for (const [ticketIdStr, count] of Object.entries(ticketCounts)) {
    const ticketId = parseInt(ticketIdStr, 10);
    if (!checkTicketAvailability(ticketId, count)) {
      const ticket = getTicketTypeById(ticketId);
      throw Object.assign(new Error(`${ticket?.name || '票种'}库存不足`), { statusCode: 400 });
    }
  }

  const orderNo = generateOrderNo();

  // Format customer name with ticket info
  const customerName = attendeesWithTicket
    .map(a => `${a.name}(${a.ticketName})`)
    .join('、');

  // Use the first attendee's ticket type as primary (for backward compatibility)
  const primaryTicketId = attendees[0].ticketTypeId;

  // Store detailed attendee info as JSON
  const attendeesInfo = JSON.stringify(attendeesWithTicket);

  const result = db.prepare(`
    INSERT INTO orders (order_no, customer_name, customer_email, customer_phone, ticket_type_id, quantity, total_amount, attendees_info)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    orderNo,
    customerName,
    customerEmail,
    customerPhone || null,
    primaryTicketId,
    attendees.length,
    totalAmount,
    attendeesInfo
  );

  // Increment sold count for each ticket type
  for (const [ticketIdStr, count] of Object.entries(ticketCounts)) {
    incrementSoldCount(parseInt(ticketIdStr, 10), count);
  }

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

export async function payOrder(orderNo: string): Promise<Order> {
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

  const paidOrder = getOrderByNo(orderNo)!;

  // Send confirmation email (don't block on failure)
  sendOrderConfirmationEmail(paidOrder).catch((err) => {
    console.error('Failed to send confirmation email:', err);
  });

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

export interface VerifyPaymentParams {
  orderNo: string;
  payerBankLast4: string;
  verifiedBy: string;
}

export async function verifyTransferPayment(params: VerifyPaymentParams): Promise<Order> {
  const db = getDatabase();
  const { orderNo, payerBankLast4, verifiedBy } = params;

  const order = getOrderByNo(orderNo);

  if (!order) {
    throw Object.assign(new Error('订单不存在'), { statusCode: 404 });
  }

  if (order.status !== 'paid') {
    throw Object.assign(new Error('只能复核已支付状态的订单'), { statusCode: 400 });
  }

  if (order.payer_bank_last4) {
    throw Object.assign(new Error('该订单已完成复核'), { statusCode: 400 });
  }

  if (!payerBankLast4 || payerBankLast4.length !== 4 || !/^\d{4}$/.test(payerBankLast4)) {
    throw Object.assign(new Error('请输入正确的银行账号后4位'), { statusCode: 400 });
  }

  db.prepare(`
    UPDATE orders
    SET payment_method = 'transfer',
        payer_bank_last4 = ?,
        verified_by = ?
    WHERE order_no = ?
  `).run(payerBankLast4, verifiedBy, orderNo);

  return db.prepare('SELECT * FROM orders WHERE order_no = ?').get(orderNo) as Order;
}
