import { api } from './client';
import type { Order } from '../types';

export interface CreateOrderParams {
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  ticketTypeId: number;
  quantity: number;
}

export async function createOrder(params: CreateOrderParams): Promise<Order> {
  const data = await api.post<{ order: Order }>('/orders', params);
  return data.order;
}

export async function getOrder(orderNo: string): Promise<Order> {
  const data = await api.get<{ order: Order }>(`/orders/${orderNo}`);
  return data.order;
}

export async function payOrder(orderNo: string): Promise<Order> {
  const data = await api.post<{ order: Order }>(`/orders/${orderNo}/pay`, {});
  return data.order;
}
