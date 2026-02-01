import { api } from './client';
import type { TicketType } from '../types';

export async function getTickets(): Promise<TicketType[]> {
  const data = await api.get<{ tickets: TicketType[] }>('/tickets');
  return data.tickets;
}
