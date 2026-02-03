import { api } from './client';

export interface PaymentMethod {
  id: string;
  name: string;
  enabled: boolean;
  bankInfo?: {
    bankName: string;
    accountName: string;
    accountNumber: string;
    note: string;
  };
}

export interface PaymentSettings {
  methods: PaymentMethod[];
}

// Public: Get enabled payment methods
export async function getEnabledPaymentMethods(): Promise<PaymentMethod[]> {
  const response = await api.get<{ methods: PaymentMethod[] }>('/settings/payment-methods');
  return response.methods;
}

// Admin: Get all payment settings
export async function getPaymentSettings(): Promise<PaymentSettings> {
  const response = await api.get<{ settings: PaymentSettings }>('/settings/admin/payment');
  return response.settings;
}

// Admin: Update payment settings
export async function updatePaymentSettings(settings: PaymentSettings): Promise<PaymentSettings> {
  const response = await api.put<{ settings: PaymentSettings }>('/settings/admin/payment', settings);
  return response.settings;
}
