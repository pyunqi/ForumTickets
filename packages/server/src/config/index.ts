import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '3000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  jwtSecret: process.env.JWT_SECRET || 'dev-secret-change-in-production',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '24h',
  adminUsername: process.env.ADMIN_USERNAME || 'admin',
  adminPassword: process.env.ADMIN_PASSWORD || 'admin123',
  databasePath: process.env.DATABASE_PATH || path.join(__dirname, '../../../data/forum_tickets.db'),
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',

  // Email configuration (Gmail)
  email: {
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT || '587', 10),
    secure: process.env.EMAIL_SECURE === 'true',
    user: process.env.EMAIL_USER || 'pyunqi@gmail.com',
    password: process.env.EMAIL_PASSWORD || 'fdkr szzx pvly gjlu',
    from: process.env.EMAIL_FROM || '学术论坛票务 <pyunqi@gmail.com>',
  },
};
