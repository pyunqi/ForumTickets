import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { config } from '../config';
import { schema } from './schema';

let db: Database.Database | null = null;

export function getDatabase(): Database.Database {
  if (!db) {
    // Ensure directory exists
    const dbDir = path.dirname(config.databasePath);
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
    }

    db = new Database(config.databasePath);
    db.pragma('journal_mode = WAL');

    // Initialize schema
    db.exec(schema);

    // Migrations for existing databases
    const migrations = [
      'ALTER TABLE orders ADD COLUMN attendees_info TEXT',
      'ALTER TABLE orders ADD COLUMN payment_method VARCHAR(20)',
      'ALTER TABLE orders ADD COLUMN payer_bank_last4 VARCHAR(4)',
      'ALTER TABLE orders ADD COLUMN verified_by VARCHAR(50)',
    ];

    for (const migration of migrations) {
      try {
        db.exec(migration);
      } catch {
        // Column already exists, ignore error
      }
    }
  }
  return db;
}

export function closeDatabase(): void {
  if (db) {
    db.close();
    db = null;
  }
}
