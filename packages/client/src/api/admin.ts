import { api } from './client';
import type { Admin, PaginatedOrders, TicketType } from '../types';

export async function getAdmins(): Promise<Admin[]> {
  const data = await api.get<{ admins: Admin[] }>('/admin/admins');
  return data.admins;
}

export interface CreateAdminParams {
  username: string;
  password: string;
  email?: string;
  role?: 'admin' | 'super_admin';
}

export async function createAdmin(params: CreateAdminParams): Promise<Admin> {
  const data = await api.post<{ admin: Admin }>('/admin/admins', params);
  return data.admin;
}

export interface UpdateAdminParams {
  username?: string;
  password?: string;
  email?: string;
  role?: string;
  is_active?: number;
}

export async function updateAdmin(id: number, params: UpdateAdminParams): Promise<Admin> {
  const data = await api.put<{ admin: Admin }>(`/admin/admins/${id}`, params);
  return data.admin;
}

export async function deleteAdmin(id: number): Promise<void> {
  await api.delete(`/admin/admins/${id}`);
}

export interface GetOrdersParams {
  page?: number;
  pageSize?: number;
  status?: string;
  search?: string;
}

export async function getOrders(params: GetOrdersParams = {}): Promise<PaginatedOrders> {
  const query = new URLSearchParams();
  if (params.page) query.set('page', params.page.toString());
  if (params.pageSize) query.set('pageSize', params.pageSize.toString());
  if (params.status) query.set('status', params.status);
  if (params.search) query.set('search', params.search);

  const queryString = query.toString();
  return api.get<PaginatedOrders>(`/admin/orders${queryString ? `?${queryString}` : ''}`);
}

export function getExportUrl(status?: string): string {
  const token = localStorage.getItem('token');
  const query = new URLSearchParams();
  if (status) query.set('status', status);
  if (token) query.set('token', token);
  const queryString = query.toString();
  return `/api/admin/orders/export${queryString ? `?${queryString}` : ''}`;
}

export async function confirmPayment(orderNo: string): Promise<void> {
  await api.post(`/admin/orders/${orderNo}/confirm-payment`, {});
}

export async function verifyTransferPayment(orderNo: string, payerBankLast4: string): Promise<void> {
  await api.post(`/admin/orders/${orderNo}/verify-transfer`, { payerBankLast4 });
}

// Ticket management
export async function getTicketsAdmin(): Promise<TicketType[]> {
  const data = await api.get<{ tickets: TicketType[] }>('/admin/tickets');
  return data.tickets;
}

export interface CreateTicketParams {
  name: string;
  description?: string;
  price: number;
  quota: number;
  is_active?: number;
}

export async function createTicket(params: CreateTicketParams): Promise<TicketType> {
  const data = await api.post<{ ticket: TicketType }>('/admin/tickets', params);
  return data.ticket;
}

export interface UpdateTicketParams {
  name?: string;
  description?: string;
  price?: number;
  quota?: number;
  is_active?: number;
}

export async function updateTicket(id: number, params: UpdateTicketParams): Promise<TicketType> {
  const data = await api.put<{ ticket: TicketType }>(`/admin/tickets/${id}`, params);
  return data.ticket;
}

export async function deleteTicket(id: number): Promise<void> {
  await api.delete(`/admin/tickets/${id}`);
}
