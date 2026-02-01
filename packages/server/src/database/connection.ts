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
  }
  return db;
}

export function closeDatabase(): void {
  if (db) {
    db.close();
    db = null;
  }
}
