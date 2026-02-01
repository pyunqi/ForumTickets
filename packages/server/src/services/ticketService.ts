import { getDatabase } from '../database/connection';

export interface TicketType {
  id: number;
  name: string;
  description: string | null;
  price: number;
  quota: number;
  sold_count: number;
  is_active: number;
  created_at: string;
}

export function getActiveTicketTypes(): TicketType[] {
  const db = getDatabase();
  return db.prepare(`
    SELECT * FROM ticket_types
    WHERE is_active = 1
    ORDER BY price ASC
  `).all() as TicketType[];
}

export function getAllTicketTypes(): TicketType[] {
  const db = getDatabase();
  return db.prepare(`
    SELECT * FROM ticket_types
    ORDER BY created_at DESC
  `).all() as TicketType[];
}

export function getTicketTypeById(id: number): TicketType | undefined {
  const db = getDatabase();
  return db.prepare('SELECT * FROM ticket_types WHERE id = ?').get(id) as TicketType | undefined;
}

export function checkTicketAvailability(ticketId: number, quantity: number): boolean {
  const ticket = getTicketTypeById(ticketId);
  if (!ticket || !ticket.is_active) return false;
  if (ticket.quota === -1) return true; // Unlimited
  return (ticket.quota - ticket.sold_count) >= quantity;
}

export function incrementSoldCount(ticketId: number, quantity: number): void {
  const db = getDatabase();
  db.prepare(`
    UPDATE ticket_types
    SET sold_count = sold_count + ?
    WHERE id = ?
  `).run(quantity, ticketId);
}

export interface CreateTicketParams {
  name: string;
  description?: string;
  price: number;
  quota: number;
  is_active?: number;
}

export function createTicketType(params: CreateTicketParams): TicketType {
  const db = getDatabase();

  const result = db.prepare(`
    INSERT INTO ticket_types (name, description, price, quota, sold_count, is_active)
    VALUES (?, ?, ?, ?, 0, ?)
  `).run(
    params.name,
    params.description || null,
    params.price,
    params.quota,
    params.is_active ?? 1
  );

  return getTicketTypeById(result.lastInsertRowid as number)!;
}

export interface UpdateTicketParams {
  name?: string;
  description?: string;
  price?: number;
  quota?: number;
  is_active?: number;
}

export function updateTicketType(id: number, params: UpdateTicketParams): TicketType {
  const db = getDatabase();

  const ticket = getTicketTypeById(id);
  if (!ticket) {
    throw Object.assign(new Error('票种不存在'), { statusCode: 404 });
  }

  const updates: string[] = [];
  const values: (string | number | null)[] = [];

  if (params.name !== undefined) {
    updates.push('name = ?');
    values.push(params.name);
  }
  if (params.description !== undefined) {
    updates.push('description = ?');
    values.push(params.description || null);
  }
  if (params.price !== undefined) {
    updates.push('price = ?');
    values.push(params.price);
  }
  if (params.quota !== undefined) {
    updates.push('quota = ?');
    values.push(params.quota);
  }
  if (params.is_active !== undefined) {
    updates.push('is_active = ?');
    values.push(params.is_active);
  }

  if (updates.length > 0) {
    values.push(id);
    db.prepare(`UPDATE ticket_types SET ${updates.join(', ')} WHERE id = ?`).run(...values);
  }

  return getTicketTypeById(id)!;
}

export function deleteTicketType(id: number): void {
  const db = getDatabase();

  const ticket = getTicketTypeById(id);
  if (!ticket) {
    throw Object.assign(new Error('票种不存在'), { statusCode: 404 });
  }

  // Check if there are orders using this ticket
  const orderCount = db.prepare(
    'SELECT COUNT(*) as count FROM orders WHERE ticket_type_id = ?'
  ).get(id) as { count: number };

  if (orderCount.count > 0) {
    throw Object.assign(new Error('该票种已有订单，无法删除，请改为禁用'), { statusCode: 400 });
  }

  db.prepare('DELETE FROM ticket_types WHERE id = ?').run(id);
}
