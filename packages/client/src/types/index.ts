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

export interface AttendeeInfo {
  name: string;
  ticketTypeId: number;
  ticketName?: string;
  ticketPrice?: number;
}

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
  ticket_name?: string;
  ticket_price?: number;
  attendees_info?: string;
  payment_method?: string;
  payer_bank_last4?: string;
  verified_by?: string;
}

export interface Admin {
  id: number;
  username: string;
  email: string | null;
  role: 'super_admin' | 'admin';
  is_active: number;
  created_at: string;
  updated_at: string;
}

export interface LoginResponse {
  token: string;
  admin: Admin;
}

export interface PaginatedOrders {
  orders: Order[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
