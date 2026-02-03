import nodemailer from 'nodemailer';
import { config } from '../config';
import { OrderWithTicket, AttendeeInfo } from './orderService';

const transporter = nodemailer.createTransport({
  host: config.email.host,
  port: config.email.port,
  secure: config.email.secure,
  auth: {
    user: config.email.user,
    pass: config.email.password,
  },
});

export async function sendOrderConfirmationEmail(order: OrderWithTicket): Promise<void> {
  let attendeesHtml = '';
  let attendeesText = '';

  if (order.attendees_info) {
    try {
      const attendees: AttendeeInfo[] = JSON.parse(order.attendees_info);
      attendeesHtml = `
        <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
          <thead>
            <tr style="background: #f8f9fa;">
              <th style="padding: 12px; text-align: left; border-bottom: 2px solid #dee2e6;">参会人 / Attendee</th>
              <th style="padding: 12px; text-align: left; border-bottom: 2px solid #dee2e6;">票种 / Ticket Type</th>
              <th style="padding: 12px; text-align: right; border-bottom: 2px solid #dee2e6;">价格 / Price</th>
            </tr>
          </thead>
          <tbody>
            ${attendees.map(a => `
              <tr>
                <td style="padding: 12px; border-bottom: 1px solid #dee2e6;">${a.name}</td>
                <td style="padding: 12px; border-bottom: 1px solid #dee2e6;">${a.ticketName}</td>
                <td style="padding: 12px; text-align: right; border-bottom: 1px solid #dee2e6;">¥${a.ticketPrice?.toFixed(2)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      `;
      attendeesText = attendees.map(a => `  - ${a.name}: ${a.ticketName} (¥${a.ticketPrice?.toFixed(2)})`).join('\n');
    } catch (e) {
      // Fallback to basic info
    }
  }

  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: 'Noto Serif SC', Georgia, serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #1a365d 0%, #2c5282 100%); color: white; padding: 30px; text-align: center; }
    .header h1 { margin: 0; font-size: 24px; }
    .content { padding: 30px; background: #fff; }
    .order-info { background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; }
    .order-no { font-size: 18px; font-weight: bold; color: #1a365d; }
    .total { font-size: 20px; color: #7b2c3a; font-weight: bold; margin-top: 20px; text-align: right; }
    .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; }
    .badge { display: inline-block; background: #28a745; color: white; padding: 4px 12px; border-radius: 4px; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>2026 国际学术论坛</h1>
      <p>International Academic Forum 2026</p>
    </div>
    <div class="content">
      <h2>订单确认 / Order Confirmation</h2>
      <p>尊敬的参会者，您好！/ Dear Attendee,</p>
      <p>感谢您的报名！您的订单已成功支付。/ Thank you for your registration! Your order has been paid successfully.</p>

      <div class="order-info">
        <p class="order-no">订单号 / Order No: ${order.order_no}</p>
        <p>状态 / Status: <span class="badge">已支付 / Paid</span></p>
        <p>支付时间 / Paid at: ${order.paid_at ? new Date(order.paid_at).toLocaleString('zh-CN') : '-'}</p>
      </div>

      <h3>参会人信息 / Attendee Information</h3>
      ${attendeesHtml || `<p>${order.customer_name}</p>`}

      <p class="total">总计 / Total: ¥${order.total_amount.toFixed(2)}</p>

      <hr style="margin: 30px 0; border: none; border-top: 1px solid #dee2e6;">

      <h3>会议信息 / Conference Information</h3>
      <p><strong>地点 / Venue:</strong> 新西兰教科文中心 / New Zealand UNESCO Center</p>
      <p><strong>日期 / Date:</strong> 2026年6月15-17日 / June 15-17, 2026</p>

      <p style="margin-top: 30px;">如有任何问题，请联系我们。/ If you have any questions, please contact us.</p>
    </div>
    <div class="footer">
      <p>此邮件由系统自动发送，请勿直接回复。</p>
      <p>This is an automated email. Please do not reply directly.</p>
    </div>
  </div>
</body>
</html>
  `;

  const textContent = `
2026 国际学术论坛 / International Academic Forum 2026
================================================

订单确认 / Order Confirmation

尊敬的参会者，您好！
感谢您的报名！您的订单已成功支付。

Dear Attendee,
Thank you for your registration! Your order has been paid successfully.

订单信息 / Order Information
----------------------------
订单号 / Order No: ${order.order_no}
状态 / Status: 已支付 / Paid
支付时间 / Paid at: ${order.paid_at ? new Date(order.paid_at).toLocaleString('zh-CN') : '-'}

参会人信息 / Attendee Information
----------------------------
${attendeesText || order.customer_name}

总计 / Total: ¥${order.total_amount.toFixed(2)}

会议信息 / Conference Information
----------------------------
地点 / Venue: 新西兰教科文中心 / New Zealand UNESCO Center
日期 / Date: 2026年6月15-17日 / June 15-17, 2026

如有任何问题，请联系我们。
If you have any questions, please contact us.
  `;

  await transporter.sendMail({
    from: config.email.from,
    to: order.customer_email,
    subject: `订单确认 - ${order.order_no} / Order Confirmation`,
    text: textContent,
    html: htmlContent,
  });
}

// Verify email configuration on startup
export async function verifyEmailConnection(): Promise<boolean> {
  try {
    await transporter.verify();
    console.log('✓ Email service connected successfully');
    return true;
  } catch (error) {
    console.error('✗ Email service connection failed:', error);
    return false;
  }
}
