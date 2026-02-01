import app from './app';
import { config } from './config';
import { getDatabase } from './database/connection';
import { hashPassword } from './utils/password';

async function bootstrap() {
  // Initialize database
  const db = getDatabase();

  // Auto-seed super admin if not exists
  const existingAdmin = db.prepare('SELECT id FROM admins WHERE role = ?').get('super_admin');
  if (!existingAdmin) {
    const passwordHash = await hashPassword(config.adminPassword);
    db.prepare(`
      INSERT INTO admins (username, password_hash, email, role, is_active)
      VALUES (?, ?, ?, 'super_admin', 1)
    `).run(config.adminUsername, passwordHash, 'admin@example.com');
    console.log(`Created super admin: ${config.adminUsername}`);
  }

  // Auto-seed ticket types if none exist
  const ticketCount = db.prepare('SELECT COUNT(*) as count FROM ticket_types').get() as { count: number };
  if (ticketCount.count === 0) {
    const ticketTypes = [
      { name: '普通票', description: '标准入场票，包含基本权益', price: 99.00, quota: 500 },
      { name: 'VIP票', description: 'VIP专属座位，含精美礼品及专属服务', price: 299.00, quota: 100 },
      { name: '学生票', description: '学生专享优惠票，需出示学生证', price: 59.00, quota: 200 },
    ];

    const insert = db.prepare(`
      INSERT INTO ticket_types (name, description, price, quota, sold_count, is_active)
      VALUES (?, ?, ?, ?, 0, 1)
    `);

    for (const ticket of ticketTypes) {
      insert.run(ticket.name, ticket.description, ticket.price, ticket.quota);
    }
    console.log('Created default ticket types');
  }

  // Start server
  app.listen(config.port, () => {
    console.log(`Server running on port ${config.port}`);
    console.log(`Environment: ${config.nodeEnv}`);
  });
}

bootstrap().catch(console.error);
