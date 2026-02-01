import { getDatabase } from '../database/connection';
import { hashPassword, verifyPassword } from '../utils/password';
import { generateToken, JwtPayload } from '../utils/jwt';

export interface Admin {
  id: number;
  username: string;
  password_hash: string;
  email: string | null;
  role: 'super_admin' | 'admin';
  is_active: number;
  created_at: string;
  updated_at: string;
}

export interface AdminPublic {
  id: number;
  username: string;
  email: string | null;
  role: string;
  is_active: number;
  created_at: string;
  updated_at: string;
}

export interface LoginResult {
  token: string;
  admin: AdminPublic;
}

export async function login(username: string, password: string): Promise<LoginResult> {
  const db = getDatabase();
  const admin = db.prepare('SELECT * FROM admins WHERE username = ? AND is_active = 1').get(username) as Admin | undefined;

  if (!admin) {
    throw Object.assign(new Error('用户名或密码错误'), { statusCode: 401 });
  }

  const isValid = await verifyPassword(password, admin.password_hash);
  if (!isValid) {
    throw Object.assign(new Error('用户名或密码错误'), { statusCode: 401 });
  }

  const payload: JwtPayload = {
    id: admin.id,
    username: admin.username,
    role: admin.role,
  };

  const token = generateToken(payload);

  return {
    token,
    admin: {
      id: admin.id,
      username: admin.username,
      email: admin.email,
      role: admin.role,
      is_active: admin.is_active,
      created_at: admin.created_at,
      updated_at: admin.updated_at,
    },
  };
}

export function getAdminById(id: number): AdminPublic | undefined {
  const db = getDatabase();
  const admin = db.prepare(`
    SELECT id, username, email, role, is_active, created_at, updated_at
    FROM admins WHERE id = ?
  `).get(id) as AdminPublic | undefined;
  return admin;
}

export function listAdmins(): AdminPublic[] {
  const db = getDatabase();
  return db.prepare(`
    SELECT id, username, email, role, is_active, created_at, updated_at
    FROM admins
    ORDER BY created_at DESC
  `).all() as AdminPublic[];
}

export interface CreateAdminParams {
  username: string;
  password: string;
  email?: string;
  role?: 'admin' | 'super_admin';
}

export async function createAdmin(params: CreateAdminParams): Promise<AdminPublic> {
  const db = getDatabase();

  // Check if username exists
  const existing = db.prepare('SELECT id FROM admins WHERE username = ?').get(params.username);
  if (existing) {
    throw Object.assign(new Error('用户名已存在'), { statusCode: 400 });
  }

  const passwordHash = await hashPassword(params.password);

  const result = db.prepare(`
    INSERT INTO admins (username, password_hash, email, role)
    VALUES (?, ?, ?, ?)
  `).run(params.username, passwordHash, params.email || null, params.role || 'admin');

  return getAdminById(result.lastInsertRowid as number)!;
}

export interface UpdateAdminParams {
  username?: string;
  password?: string;
  email?: string;
  role?: string;
  is_active?: number;
}

export async function updateAdmin(id: number, params: UpdateAdminParams): Promise<AdminPublic> {
  const db = getDatabase();

  const admin = db.prepare('SELECT * FROM admins WHERE id = ?').get(id) as Admin | undefined;
  if (!admin) {
    throw Object.assign(new Error('管理员不存在'), { statusCode: 404 });
  }

  // Prevent deactivating the last super admin
  if (params.is_active === 0 && admin.role === 'super_admin') {
    const superAdminCount = db.prepare(
      'SELECT COUNT(*) as count FROM admins WHERE role = ? AND is_active = 1'
    ).get('super_admin') as { count: number };

    if (superAdminCount.count <= 1) {
      throw Object.assign(new Error('不能禁用最后一个超级管理员'), { statusCode: 400 });
    }
  }

  if (params.username && params.username !== admin.username) {
    const existing = db.prepare('SELECT id FROM admins WHERE username = ? AND id != ?').get(params.username, id);
    if (existing) {
      throw Object.assign(new Error('用户名已存在'), { statusCode: 400 });
    }
  }

  const updates: string[] = [];
  const values: (string | number)[] = [];

  if (params.username) {
    updates.push('username = ?');
    values.push(params.username);
  }
  if (params.password) {
    updates.push('password_hash = ?');
    values.push(await hashPassword(params.password));
  }
  if (params.email !== undefined) {
    updates.push('email = ?');
    values.push(params.email);
  }
  if (params.role) {
    updates.push('role = ?');
    values.push(params.role);
  }
  if (params.is_active !== undefined) {
    updates.push('is_active = ?');
    values.push(params.is_active);
  }

  if (updates.length > 0) {
    updates.push('updated_at = CURRENT_TIMESTAMP');
    values.push(id);
    db.prepare(`UPDATE admins SET ${updates.join(', ')} WHERE id = ?`).run(...values);
  }

  return getAdminById(id)!;
}

export function deleteAdmin(id: number, currentUserId: number): void {
  const db = getDatabase();

  if (id === currentUserId) {
    throw Object.assign(new Error('不能删除自己'), { statusCode: 400 });
  }

  const admin = db.prepare('SELECT * FROM admins WHERE id = ?').get(id) as Admin | undefined;
  if (!admin) {
    throw Object.assign(new Error('管理员不存在'), { statusCode: 404 });
  }

  // Prevent deleting the last super admin
  if (admin.role === 'super_admin') {
    const superAdminCount = db.prepare(
      'SELECT COUNT(*) as count FROM admins WHERE role = ?'
    ).get('super_admin') as { count: number };

    if (superAdminCount.count <= 1) {
      throw Object.assign(new Error('不能删除最后一个超级管理员'), { statusCode: 400 });
    }
  }

  db.prepare('DELETE FROM admins WHERE id = ?').run(id);
}
