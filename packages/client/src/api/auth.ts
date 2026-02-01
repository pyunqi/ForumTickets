import { api } from './client';
import type { Admin, LoginResponse } from '../types';

export async function login(username: string, password: string): Promise<LoginResponse> {
  return api.post<LoginResponse>('/auth/login', { username, password });
}

export async function getMe(): Promise<Admin> {
  const data = await api.get<{ admin: Admin }>('/auth/me');
  return data.admin;
}
