import { getDatabase } from '../database/connection';

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

export function getAllConferences(): Conference[] {
  const db = getDatabase();
  return db.prepare('SELECT * FROM conferences ORDER BY created_at DESC').all() as Conference[];
}

export function getConferenceById(id: number): Conference | undefined {
  const db = getDatabase();
  return db.prepare('SELECT * FROM conferences WHERE id = ?').get(id) as Conference | undefined;
}

export function getActiveConference(): Conference | undefined {
  const db = getDatabase();
  return db.prepare('SELECT * FROM conferences WHERE is_active = 1').get() as Conference | undefined;
}

export function createConference(params: CreateConferenceParams): Conference {
  const db = getDatabase();

  const result = db.prepare(`
    INSERT INTO conferences (name_zh, name_en, subtitle_zh, subtitle_en, date_start, date_end, checkin_time, venue_zh, venue_en, contact_email)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    params.name_zh,
    params.name_en,
    params.subtitle_zh || null,
    params.subtitle_en || null,
    params.date_start,
    params.date_end,
    params.checkin_time || null,
    params.venue_zh,
    params.venue_en,
    params.contact_email || null
  );

  return getConferenceById(result.lastInsertRowid as number)!;
}

export function updateConference(id: number, params: UpdateConferenceParams): Conference {
  const db = getDatabase();
  const conference = getConferenceById(id);

  if (!conference) {
    throw Object.assign(new Error('会议不存在'), { statusCode: 404 });
  }

  // If activating this conference, deactivate all others first
  if (params.is_active === 1) {
    db.prepare('UPDATE conferences SET is_active = 0, updated_at = CURRENT_TIMESTAMP').run();
  }

  const updates: string[] = [];
  const values: (string | number | null)[] = [];

  if (params.name_zh !== undefined) {
    updates.push('name_zh = ?');
    values.push(params.name_zh);
  }
  if (params.name_en !== undefined) {
    updates.push('name_en = ?');
    values.push(params.name_en);
  }
  if (params.subtitle_zh !== undefined) {
    updates.push('subtitle_zh = ?');
    values.push(params.subtitle_zh || null);
  }
  if (params.subtitle_en !== undefined) {
    updates.push('subtitle_en = ?');
    values.push(params.subtitle_en || null);
  }
  if (params.date_start !== undefined) {
    updates.push('date_start = ?');
    values.push(params.date_start);
  }
  if (params.date_end !== undefined) {
    updates.push('date_end = ?');
    values.push(params.date_end);
  }
  if (params.checkin_time !== undefined) {
    updates.push('checkin_time = ?');
    values.push(params.checkin_time || null);
  }
  if (params.venue_zh !== undefined) {
    updates.push('venue_zh = ?');
    values.push(params.venue_zh);
  }
  if (params.venue_en !== undefined) {
    updates.push('venue_en = ?');
    values.push(params.venue_en);
  }
  if (params.contact_email !== undefined) {
    updates.push('contact_email = ?');
    values.push(params.contact_email || null);
  }
  if (params.is_active !== undefined) {
    updates.push('is_active = ?');
    values.push(params.is_active);
  }

  if (updates.length > 0) {
    updates.push('updated_at = CURRENT_TIMESTAMP');
    values.push(id);
    db.prepare(`UPDATE conferences SET ${updates.join(', ')} WHERE id = ?`).run(...values);
  }

  return getConferenceById(id)!;
}

export function deleteConference(id: number): void {
  const db = getDatabase();
  const conference = getConferenceById(id);

  if (!conference) {
    throw Object.assign(new Error('会议不存在'), { statusCode: 404 });
  }

  if (conference.is_active) {
    throw Object.assign(new Error('不能删除当前激活的会议'), { statusCode: 400 });
  }

  db.prepare('DELETE FROM conferences WHERE id = ?').run(id);
}

export function activateConference(id: number): Conference {
  return updateConference(id, { is_active: 1 });
}

// Initialize default conference if none exists
export function initializeDefaultConference(): void {
  const db = getDatabase();
  const count = db.prepare('SELECT COUNT(*) as count FROM conferences').get() as { count: number };

  if (count.count === 0) {
    const conference = createConference({
      name_zh: '第十二届国际学术论坛',
      name_en: '12th International Academic Forum',
      subtitle_zh: '人工智能与人文社科的交叉融合',
      subtitle_en: 'The Intersection of AI and Humanities',
      date_start: '2026-06-15',
      date_end: '2026-06-17',
      checkin_time: '08:30 - 09:00',
      venue_zh: '新西兰教科文中心',
      venue_en: 'New Zealand UNESCO Center',
      contact_email: 'forum2026@example.com',
    });
    // Activate the default conference
    activateConference(conference.id);
    console.log('Created default conference');
  }
}
