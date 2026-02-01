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
};
