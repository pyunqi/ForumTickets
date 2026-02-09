import { Request, Response, NextFunction } from 'express';
import * as settingsService from '../services/settingsService';

// Get payment settings (admin only)
export function getPaymentSettings(req: Request, res: Response, next: NextFunction): void {
  try {
    const settings = settingsService.getPaymentSettings();
    res.json({ settings });
  } catch (error) {
    next(error);
  }
}

// Update payment settings (admin only)
export function updatePaymentSettings(req: Request, res: Response, next: NextFunction): void {
  try {
    const { methods } = req.body;

    if (!methods || !Array.isArray(methods)) {
      res.status(400).json({ error: 'methods is required and must be an array' });
      return;
    }

    // Validate each method
    for (const method of methods) {
      if (!method.id || !method.name || typeof method.enabled !== 'boolean') {
        res.status(400).json({ error: 'Each method must have id, name, and enabled fields' });
        return;
      }
    }

    const settings = settingsService.updatePaymentSettings({ methods });
    res.json({ settings });
  } catch (error) {
    next(error);
  }
}

// Get enabled payment methods (public)
export function getEnabledPaymentMethods(req: Request, res: Response, next: NextFunction): void {
  try {
    const methods = settingsService.getEnabledPaymentMethods();
    res.json({ methods });
  } catch (error) {
    next(error);
  }
}

// Get page visibility settings (public)
export function getPageVisibility(req: Request, res: Response, next: NextFunction): void {
  try {
    const settings = settingsService.getPageVisibility();
    res.json({ settings });
  } catch (error) {
    next(error);
  }
}

// Update page visibility settings (admin only)
export function updatePageVisibility(req: Request, res: Response, next: NextFunction): void {
  try {
    const { sections } = req.body;

    if (!sections || !Array.isArray(sections)) {
      res.status(400).json({ error: 'sections is required and must be an array' });
      return;
    }

    for (const section of sections) {
      if (!section.id || !section.name || typeof section.enabled !== 'boolean') {
        res.status(400).json({ error: 'Each section must have id, name, and enabled fields' });
        return;
      }
    }

    const settings = settingsService.updatePageVisibility({ sections });
    res.json({ settings });
  } catch (error) {
    next(error);
  }
}
