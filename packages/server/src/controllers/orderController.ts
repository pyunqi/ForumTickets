import { Request, Response, NextFunction } from 'express';
import { createOrder, getOrderByNo, payOrder } from '../services/orderService';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function create(req: Request, res: Response, next: NextFunction): void {
  try {
    const { customerName, customerEmail, customerPhone, ticketTypeId, quantity = 1 } = req.body;

    // Validation
    if (!customerName || !customerName.trim()) {
      res.status(400).json({ error: '请填写姓名' });
      return;
    }

    if (!customerEmail || !EMAIL_REGEX.test(customerEmail)) {
      res.status(400).json({ error: '请填写有效的邮箱地址' });
      return;
    }

    if (!ticketTypeId) {
      res.status(400).json({ error: '请选择票种' });
      return;
    }

    if (quantity < 1 || quantity > 10) {
      res.status(400).json({ error: '购票数量应在1-10之间' });
      return;
    }

    const order = createOrder({
      customerName: customerName.trim(),
      customerEmail: customerEmail.trim().toLowerCase(),
      customerPhone: customerPhone?.trim() || undefined,
      ticketTypeId,
      quantity,
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

export function pay(req: Request, res: Response, next: NextFunction): void {
  try {
    const { orderNo } = req.params;
    const order = payOrder(orderNo);
    res.json({ order, message: '支付成功' });
  } catch (error) {
    next(error);
  }
}
