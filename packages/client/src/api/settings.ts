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

// ===== Homepage Content Settings =====

export interface HomepageContent {
  stats: Array<{ value: string; label_zh: string; label_en: string }>;
  speakers: Array<{
    name_zh: string; name_en: string;
    title_zh: string; title_en: string;
    org_zh: string; org_en: string;
    field_zh: string; field_en: string;
  }>;
  schedule: {
    day1: Array<{ time: string; title_zh: string; title_en: string; desc_zh: string; desc_en: string }>;
    day2: Array<{ time: string; title_zh: string; title_en: string; desc_zh: string; desc_en: string }>;
  };
  footer: {
    organizers: Array<{ name_zh: string; name_en: string }>;
    contact: { email: string; phone: string; address: string };
  };
  hero: {
    title_zh: string; title_en: string;
    subtitle_zh: string; subtitle_en: string;
    date_zh: string; date_en: string;
    venue_zh: string; venue_en: string;
    description_zh: string; description_en: string;
  };
  about: {
    label_zh: string; label_en: string;
    title_zh: string; title_en: string;
    description1_zh: string; description1_en: string;
    description2_zh: string; description2_en: string;
    features: Array<{
      title_zh: string; title_en: string;
      desc_zh: string; desc_en: string;
    }>;
  };
  sectionTitles: {
    speakers: { label_zh: string; label_en: string; title_zh: string; title_en: string; description_zh: string; description_en: string };
    schedule: { label_zh: string; label_en: string; title_zh: string; title_en: string; day1_zh: string; day1_en: string; day2_zh: string; day2_en: string };
    sponsors: { label_zh: string; label_en: string; title_zh: string; title_en: string; description_zh: string; description_en: string };
    tickets: { label_zh: string; label_en: string; title_zh: string; title_en: string; description_zh: string; description_en: string };
  };
  cta: {
    title_zh: string; title_en: string;
    description_zh: string; description_en: string;
    button_zh: string; button_en: string;
  };
  footerText: {
    forumName_zh: string; forumName_en: string;
    slogan_zh: string; slogan_en: string;
    copyright_zh: string; copyright_en: string;
  };
}

// Public: Get homepage content
export async function getHomepageContent(): Promise<HomepageContent> {
  const response = await api.get<{ content: HomepageContent }>('/settings/homepage-content');
  return response.content;
}

// Admin: Update homepage content
export async function updateHomepageContent(content: HomepageContent): Promise<HomepageContent> {
  const response = await api.put<{ content: HomepageContent }>('/settings/admin/homepage-content', content);
  return response.content;
}
