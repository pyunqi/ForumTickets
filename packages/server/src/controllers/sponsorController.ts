import { Request, Response, NextFunction } from 'express';
import * as sponsorService from '../services/sponsorService';

// Public: Get all active sponsors
export function getActiveSponsors(req: Request, res: Response, next: NextFunction): void {
  try {
    const sponsors = sponsorService.getActiveSponsors();

    // Group by category
    const grouped = {
      organizer: sponsors.filter(s => s.category === 'organizer'),
      diamond: sponsors.filter(s => s.category === 'diamond'),
      gold: sponsors.filter(s => s.category === 'gold'),
      silver: sponsors.filter(s => s.category === 'silver'),
      media: sponsors.filter(s => s.category === 'media'),
    };

    res.json({ sponsors: grouped });
  } catch (error) {
    next(error);
  }
}

// Admin: Get all sponsors
export function getAllSponsors(req: Request, res: Response, next: NextFunction): void {
  try {
    const sponsors = sponsorService.getAllSponsors();
    res.json({ sponsors });
  } catch (error) {
    next(error);
  }
}

// Admin: Get sponsor by ID
export function getSponsorById(req: Request, res: Response, next: NextFunction): void {
  try {
    const { id } = req.params;
    const sponsor = sponsorService.getSponsorById(parseInt(id));

    if (!sponsor) {
      res.status(404).json({ error: '赞助商不存在' });
      return;
    }

    res.json({ sponsor });
  } catch (error) {
    next(error);
  }
}

// Admin: Create sponsor
export function createSponsor(req: Request, res: Response, next: NextFunction): void {
  try {
    const { name_zh, name_en, abbr, category, logo_url, website, sort_order } = req.body;

    if (!name_zh || !name_en || !category) {
      res.status(400).json({ error: '中文名称、英文名称和类别为必填项' });
      return;
    }

    const validCategories = ['organizer', 'diamond', 'gold', 'silver', 'media'];
    if (!validCategories.includes(category)) {
      res.status(400).json({ error: '无效的类别' });
      return;
    }

    const sponsor = sponsorService.createSponsor({
      name_zh,
      name_en,
      abbr,
      category,
      logo_url,
      website,
      sort_order,
    });

    res.status(201).json({ sponsor });
  } catch (error) {
    next(error);
  }
}

// Admin: Update sponsor
export function updateSponsor(req: Request, res: Response, next: NextFunction): void {
  try {
    const { id } = req.params;
    const { name_zh, name_en, abbr, category, logo_url, website, sort_order, is_active } = req.body;

    if (category) {
      const validCategories = ['organizer', 'diamond', 'gold', 'silver', 'media'];
      if (!validCategories.includes(category)) {
        res.status(400).json({ error: '无效的类别' });
        return;
      }
    }

    const sponsor = sponsorService.updateSponsor(parseInt(id), {
      name_zh,
      name_en,
      abbr,
      category,
      logo_url,
      website,
      sort_order,
      is_active,
    });

    if (!sponsor) {
      res.status(404).json({ error: '赞助商不存在' });
      return;
    }

    res.json({ sponsor });
  } catch (error) {
    next(error);
  }
}

// Admin: Delete sponsor
export function deleteSponsor(req: Request, res: Response, next: NextFunction): void {
  try {
    const { id } = req.params;
    const success = sponsorService.deleteSponsor(parseInt(id));

    if (!success) {
      res.status(404).json({ error: '赞助商不存在' });
      return;
    }

    res.json({ message: '删除成功' });
  } catch (error) {
    next(error);
  }
}
