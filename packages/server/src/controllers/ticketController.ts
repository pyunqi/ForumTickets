import { Request, Response, NextFunction } from 'express';
import { getActiveTicketTypes } from '../services/ticketService';

export function getTickets(_req: Request, res: Response, next: NextFunction): void {
  try {
    const tickets = getActiveTicketTypes();
    res.json({ tickets });
  } catch (error) {
    next(error);
  }
}
