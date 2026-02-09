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

// ===== Page Visibility Settings =====

export interface PageSection {
  id: string;
  name: string;
  enabled: boolean;
}

export interface PageVisibility {
  sections: PageSection[];
}

// Public: Get page visibility settings
export async function getPageVisibility(): Promise<PageVisibility> {
  const response = await api.get<{ settings: PageVisibility }>('/settings/page-visibility');
  return response.settings;
}

// Admin: Update page visibility settings
export async function updatePageVisibility(settings: PageVisibility): Promise<PageVisibility> {
  const response = await api.put<{ settings: PageVisibility }>('/settings/admin/page-visibility', settings);
  return response.settings;
}
