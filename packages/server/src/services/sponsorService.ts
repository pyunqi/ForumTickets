import { getDatabase } from '../database/connection';

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

// Initialize default sponsors
export function initializeDefaultSponsors(): void {
  const db = getDatabase();
  const count = db.prepare('SELECT COUNT(*) as count FROM sponsors').get() as { count: number };

  if (count.count === 0) {
    const defaultSponsors = [
      // 主办单位
      { name_zh: '新西兰教科文中心', name_en: 'New Zealand Education Centre', abbr: 'NZEC', category: 'organizer', sort_order: 1 },
      { name_zh: '奥克兰大学', name_en: 'University of Auckland', abbr: 'UoA', category: 'organizer', sort_order: 2 },
      // 钻石赞助
      { name_zh: '科技创新公司', name_en: 'Tech Innovation Co.', abbr: 'TIC', category: 'diamond', sort_order: 1 },
      { name_zh: '环球教育集团', name_en: 'Global Education Group', abbr: 'GEG', category: 'diamond', sort_order: 2 },
      { name_zh: '未来科学基金会', name_en: 'Future Science Foundation', abbr: 'FSF', category: 'diamond', sort_order: 3 },
      // 金牌赞助
      { name_zh: '智能技术公司', name_en: 'Smart Tech Corp', abbr: null, category: 'gold', sort_order: 1 },
      { name_zh: '数据科学学院', name_en: 'Data Science Academy', abbr: null, category: 'gold', sort_order: 2 },
      { name_zh: '创新研究院', name_en: 'Innovation Research Institute', abbr: null, category: 'gold', sort_order: 3 },
      { name_zh: '国际教育联盟', name_en: 'International Education Alliance', abbr: null, category: 'gold', sort_order: 4 },
      // 支持媒体
      { name_zh: '学术新闻网', name_en: 'Academic News Network', abbr: null, category: 'media', sort_order: 1 },
      { name_zh: '教育时报', name_en: 'Education Times', abbr: null, category: 'media', sort_order: 2 },
      { name_zh: '科技前沿', name_en: 'Tech Frontier', abbr: null, category: 'media', sort_order: 3 },
      { name_zh: '全球学术周刊', name_en: 'Global Academic Weekly', abbr: null, category: 'media', sort_order: 4 },
    ];

    const stmt = db.prepare(`
      INSERT INTO sponsors (name_zh, name_en, abbr, category, sort_order)
      VALUES (?, ?, ?, ?, ?)
    `);

    for (const sponsor of defaultSponsors) {
      stmt.run(sponsor.name_zh, sponsor.name_en, sponsor.abbr, sponsor.category, sponsor.sort_order);
    }
  }
}

export function getAllSponsors(): Sponsor[] {
  const db = getDatabase();
  return db.prepare('SELECT * FROM sponsors ORDER BY category, sort_order, id').all() as Sponsor[];
}

export function getActiveSponsors(): Sponsor[] {
  const db = getDatabase();
  return db.prepare('SELECT * FROM sponsors WHERE is_active = 1 ORDER BY category, sort_order, id').all() as Sponsor[];
}

export function getSponsorsByCategory(category: string): Sponsor[] {
  const db = getDatabase();
  return db.prepare('SELECT * FROM sponsors WHERE category = ? AND is_active = 1 ORDER BY sort_order, id')
    .all(category) as Sponsor[];
}

export function getSponsorById(id: number): Sponsor | null {
  const db = getDatabase();
  return db.prepare('SELECT * FROM sponsors WHERE id = ?').get(id) as Sponsor | null;
}

export function createSponsor(params: CreateSponsorParams): Sponsor {
  const db = getDatabase();
  const result = db.prepare(`
    INSERT INTO sponsors (name_zh, name_en, abbr, category, logo_url, website, sort_order)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(
    params.name_zh,
    params.name_en,
    params.abbr || null,
    params.category,
    params.logo_url || null,
    params.website || null,
    params.sort_order || 0
  );

  return getSponsorById(result.lastInsertRowid as number)!;
}

export function updateSponsor(id: number, params: UpdateSponsorParams): Sponsor | null {
  const db = getDatabase();
  const sponsor = getSponsorById(id);
  if (!sponsor) return null;

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
  if (params.abbr !== undefined) {
    updates.push('abbr = ?');
    values.push(params.abbr || null);
  }
  if (params.category !== undefined) {
    updates.push('category = ?');
    values.push(params.category);
  }
  if (params.logo_url !== undefined) {
    updates.push('logo_url = ?');
    values.push(params.logo_url || null);
  }
  if (params.website !== undefined) {
    updates.push('website = ?');
    values.push(params.website || null);
  }
  if (params.sort_order !== undefined) {
    updates.push('sort_order = ?');
    values.push(params.sort_order);
  }
  if (params.is_active !== undefined) {
    updates.push('is_active = ?');
    values.push(params.is_active);
  }

  if (updates.length === 0) return sponsor;

  values.push(id);
  db.prepare(`UPDATE sponsors SET ${updates.join(', ')} WHERE id = ?`).run(...values);

  return getSponsorById(id);
}

export function deleteSponsor(id: number): boolean {
  const db = getDatabase();
  const result = db.prepare('DELETE FROM sponsors WHERE id = ?').run(id);
  return result.changes > 0;
}
