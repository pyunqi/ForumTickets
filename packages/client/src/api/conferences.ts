import { api } from './client';

export interface Conference {
  id: number;
  name_zh: string;
  name_en: string;
  subtitle_zh: string | null;
  subtitle_en: string | null;
  date_start: string;
  date_end: string;
  checkin_time: string | null;
  venue_zh: string;
  venue_en: string;
  contact_email: string | null;
  is_active: number;
  created_at: string;
  updated_at: string;
}

export interface CreateConferenceParams {
  name_zh: string;
  name_en: string;
  subtitle_zh?: string;
  subtitle_en?: string;
  date_start: string;
  date_end: string;
  checkin_time?: string;
  venue_zh: string;
  venue_en: string;
  contact_email?: string;
}

export interface UpdateConferenceParams extends Partial<CreateConferenceParams> {
  is_active?: number;
}

// Public API
export async function getActiveConference(): Promise<Conference | null> {
  try {
    const response = await api.get<{ conference: Conference }>('/conferences/active');
    return response.conference;
  } catch {
    return null;
  }
}

// Admin API
export async function getAllConferences(): Promise<Conference[]> {
  const response = await api.get<{ conferences: Conference[] }>('/admin/conferences');
  return response.conferences;
}

export async function getConferenceById(id: number): Promise<Conference> {
  const response = await api.get<{ conference: Conference }>(`/admin/conferences/${id}`);
  return response.conference;
}

export async function createConference(params: CreateConferenceParams): Promise<Conference> {
  const response = await api.post<{ conference: Conference }>('/admin/conferences', params);
  return response.conference;
}

export async function updateConference(id: number, params: UpdateConferenceParams): Promise<Conference> {
  const response = await api.put<{ conference: Conference }>(`/admin/conferences/${id}`, params);
  return response.conference;
}

export async function deleteConference(id: number): Promise<void> {
  await api.delete(`/admin/conferences/${id}`);
}

export async function activateConference(id: number): Promise<Conference> {
  const response = await api.post<{ conference: Conference }>(`/admin/conferences/${id}/activate`, {});
  return response.conference;
}
