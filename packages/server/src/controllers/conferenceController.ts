import { Request, Response, NextFunction } from 'express';
import {
  getAllConferences,
  getConferenceById,
  getActiveConference,
  createConference,
  updateConference,
  deleteConference,
  activateConference,
} from '../services/conferenceService';

// Public: Get active conference
export function getActive(req: Request, res: Response, next: NextFunction): void {
  try {
    const conference = getActiveConference();
    if (!conference) {
      res.status(404).json({ error: '没有激活的会议' });
      return;
    }
    res.json({ conference });
  } catch (error) {
    next(error);
  }
}

// Admin: List all conferences
export function list(req: Request, res: Response, next: NextFunction): void {
  try {
    const conferences = getAllConferences();
    res.json({ conferences });
  } catch (error) {
    next(error);
  }
}

// Admin: Get single conference
export function getById(req: Request, res: Response, next: NextFunction): void {
  try {
    const id = parseInt(req.params.id, 10);
    const conference = getConferenceById(id);

    if (!conference) {
      res.status(404).json({ error: '会议不存在' });
      return;
    }

    res.json({ conference });
  } catch (error) {
    next(error);
  }
}

// Admin: Create conference
export function create(req: Request, res: Response, next: NextFunction): void {
  try {
    const { name_zh, name_en, subtitle_zh, subtitle_en, date_start, date_end, checkin_time, venue_zh, venue_en, contact_email } = req.body;

    if (!name_zh || !name_en || !date_start || !date_end || !venue_zh || !venue_en) {
      res.status(400).json({ error: '请填写必填项' });
      return;
    }

    const conference = createConference({
      name_zh,
      name_en,
      subtitle_zh,
      subtitle_en,
      date_start,
      date_end,
      checkin_time,
      venue_zh,
      venue_en,
      contact_email,
    });

    res.status(201).json({ conference });
  } catch (error) {
    next(error);
  }
}

// Admin: Update conference
export function update(req: Request, res: Response, next: NextFunction): void {
  try {
    const id = parseInt(req.params.id, 10);
    const conference = updateConference(id, req.body);
    res.json({ conference });
  } catch (error) {
    next(error);
  }
}

// Admin: Delete conference
export function remove(req: Request, res: Response, next: NextFunction): void {
  try {
    const id = parseInt(req.params.id, 10);
    deleteConference(id);
    res.json({ message: '删除成功' });
  } catch (error) {
    next(error);
  }
}

// Admin: Activate conference
export function activate(req: Request, res: Response, next: NextFunction): void {
  try {
    const id = parseInt(req.params.id, 10);
    const conference = activateConference(id);
    res.json({ conference, message: '激活成功' });
  } catch (error) {
    next(error);
  }
}
