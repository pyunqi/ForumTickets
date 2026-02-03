import { api } from './client';

export interface Sponsor {
  id: number;
  name_zh: string;
  name_en: string;
  abbr: string | null;
  category: string;
  logo_url: string | null;
  website: string | null;
  sort_order: number;
  is_active: number;
  created_at: string;
}

export interface SponsorsGrouped {
  organizer: Sponsor[];
  diamond: Sponsor[];
  gold: Sponsor[];
  silver: Sponsor[];
  media: Sponsor[];
}

export interface CreateSponsorParams {
  name_zh: string;
  name_en: string;
  abbr?: string;
  category: string;
  logo_url?: string;
  website?: string;
  sort_order?: number;
}

export interface UpdateSponsorParams {
  name_zh?: string;
  name_en?: string;
  abbr?: string;
  category?: string;
  logo_url?: string;
  website?: string;
  sort_order?: number;
  is_active?: number;
}

// Public: Get active sponsors grouped by category
export async function getSponsors(): Promise<SponsorsGrouped> {
  const response = await api.get<{ sponsors: SponsorsGrouped }>('/sponsors');
  return response.sponsors;
}

// Admin: Get all sponsors
export async function getAllSponsors(): Promise<Sponsor[]> {
  const response = await api.get<{ sponsors: Sponsor[] }>('/sponsors/admin');
  return response.sponsors;
}

// Admin: Get sponsor by ID
export async function getSponsorById(id: number): Promise<Sponsor> {
  const response = await api.get<{ sponsor: Sponsor }>(`/sponsors/admin/${id}`);
  return response.sponsor;
}

// Admin: Create sponsor
export async function createSponsor(params: CreateSponsorParams): Promise<Sponsor> {
  const response = await api.post<{ sponsor: Sponsor }>('/sponsors/admin', params);
  return response.sponsor;
}

// Admin: Update sponsor
export async function updateSponsor(id: number, params: UpdateSponsorParams): Promise<Sponsor> {
  const response = await api.put<{ sponsor: Sponsor }>(`/sponsors/admin/${id}`, params);
  return response.sponsor;
}

// Admin: Delete sponsor
export async function deleteSponsor(id: number): Promise<void> {
  await api.delete(`/sponsors/admin/${id}`);
}
