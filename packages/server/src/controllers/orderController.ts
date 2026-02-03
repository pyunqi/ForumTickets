import { Request, Response, NextFunction } from 'express';
import { createOrder, getOrderByNo, payOrder } from '../services/orderService';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface AttendeeInput {
  name: string;
  ticketTypeId: number;
}

export function create(req: Request, res: Response, next: NextFunction): void {
  try {
    const { customerEmail, customerPhone, attendees } = req.body;

    // Validation
    if (!customerEmail || !EMAIL_REGEX.test(customerEmail)) {
      res.status(400).json({ error: '请填写有效的邮箱地址' });
      return;
    }

    if (!attendees || !Array.isArray(attendees) || attendees.length === 0) {
      res.status(400).json({ error: '请添加参会人' });
      return;
    }

    if (attendees.length > 5) {
      res.status(400).json({ error: '一次最多购买5张票' });
      return;
    }

    // Validate each attendee
    for (let i = 0; i < attendees.length; i++) {
      const attendee = attendees[i] as AttendeeInput;
      if (!attendee.name || !attendee.name.trim()) {
        res.status(400).json({ error: `请填写参会人 ${i + 1} 的姓名` });
        return;
      }
      if (!attendee.ticketTypeId) {
        res.status(400).json({ error: `请选择参会人 ${i + 1} 的票种` });
        return;
      }
    }

    const order = createOrder({
      customerEmail: customerEmail.trim().toLowerCase(),
      customerPhone: customerPhone?.trim() || undefined,
      attendees: attendees.map((a: AttendeeInput) => ({
        name: a.name.trim(),
        ticketTypeId: a.ticketTypeId,
      })),
    });

    res.status(201).json({ order });
  } catch (error) {
    next(error);
  }
}

export function getByOrderNo(req: Request, res: Response, next: NextFunction): void {
  try {
    const { orderNo } = req.params;
    const order = getOrderByNo(orderNo);

    if (!order) {
      res.status(404).json({ error: '订单不存在' });
      return;
    }

    res.json({ order });
  } catch (error) {
    next(error);
  }
}

export async function pay(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { orderNo } = req.params;
    const order = await payOrder(orderNo);
    res.json({ order, message: '支付成功' });
  } catch (error) {
    next(error);
  }
}
