import initSqlJs from 'sql.js';
import type { Database as SqlJsDatabase } from 'sql.js';
import path from 'path';
import fs from 'fs';
import { config } from '../config';
import { schema } from './schema';

let db: SqlJsDatabase | null = null;
let dbPath: string = '';

// Wrapper to provide better-sqlite3-like API
class Statement {
  private db: SqlJsDatabase;
  private sql: string;

  constructor(db: SqlJsDatabase, sql: string) {
    this.db = db;
    this.sql = sql;
  }

  run(...params: unknown[]): { changes: number; lastInsertRowid: number } {
    this.db.run(this.sql, params as (string | number | null | Uint8Array)[]);
    const changes = this.db.getRowsModified();
    const result = this.db.exec('SELECT last_insert_rowid() as id');
    const lastInsertRowid = result.length > 0 ? (result[0].values[0][0] as number) : 0;
    saveDatabase();
    return { changes, lastInsertRowid };
  }

  get(...params: unknown[]): unknown {
    const stmt = this.db.prepare(this.sql);
    stmt.bind(params as (string | number | null | Uint8Array)[]);
    if (stmt.step()) {
      const columns = stmt.getColumnNames();
      const values = stmt.get();
      stmt.free();
      const row: Record<string, unknown> = {};
      columns.forEach((col: string, i: number) => {
        row[col] = values[i];
      });
      return row;
    }
    stmt.free();
    return undefined;
  }

  all(...params: unknown[]): unknown[] {
    const stmt = this.db.prepare(this.sql);
    stmt.bind(params as (string | number | null | Uint8Array)[]);
    const results: Record<string, unknown>[] = [];
    const columns = stmt.getColumnNames();
    while (stmt.step()) {
      const values = stmt.get();
      const row: Record<string, unknown> = {};
      columns.forEach((col: string, i: number) => {
        row[col] = values[i];
      });
      results.push(row);
    }
    stmt.free();
    return results;
  }
}

// Database wrapper
class DatabaseWrapper {
  private db: SqlJsDatabase;

  constructor(db: SqlJsDatabase) {
    this.db = db;
  }

  prepare(sql: string): Statement {
    return new Statement(this.db, sql);
  }

  exec(sql: string): void {
    this.db.run(sql);
    saveDatabase();
  }

  pragma(_pragma: string): void {
    // sql.js doesn't support WAL mode, ignore
  }

  close(): void {
    saveDatabase();
    this.db.close();
  }
}

function saveDatabase(): void {
  if (db && dbPath) {
    const data = db.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(dbPath, buffer);
  }
}

let dbWrapper: DatabaseWrapper | null = null;
let initPromise: Promise<void> | null = null;

async function initDatabase(): Promise<void> {
  if (db) return;

  const SQL = await initSqlJs();
  dbPath = config.databasePath;

  // Ensure directory exists
  const dbDir = path.dirname(dbPath);
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }

  // Load existing database or create new one
  if (fs.existsSync(dbPath)) {
    const fileBuffer = fs.readFileSync(dbPath);
    db = new SQL.Database(fileBuffer);
  } else {
    db = new SQL.Database();
  }

  // Initialize schema
  db.run(schema);

  // Migrations for existing databases
  const migrations = [
    'ALTER TABLE orders ADD COLUMN attendees_info TEXT',
    'ALTER TABLE orders ADD COLUMN payment_method VARCHAR(20)',
    'ALTER TABLE orders ADD COLUMN payer_bank_last4 VARCHAR(4)',
    'ALTER TABLE orders ADD COLUMN verified_by VARCHAR(50)',
  ];

  for (const migration of migrations) {
    try {
      db.run(migration);
    } catch {
      // Column already exists, ignore error
    }
  }

  saveDatabase();
  dbWrapper = new DatabaseWrapper(db);
}

export function getDatabase(): DatabaseWrapper {
  if (!dbWrapper) {
    throw new Error('Database not initialized. Call initDatabaseAsync() first.');
  }
  return dbWrapper;
}

export async function initDatabaseAsync(): Promise<DatabaseWrapper> {
  if (!initPromise) {
    initPromise = initDatabase();
  }
  await initPromise;
  return dbWrapper!;
}

export function closeDatabase(): void {
  if (dbWrapper) {
    dbWrapper.close();
    db = null;
    dbWrapper = null;
    initPromise = null;
  }
}
