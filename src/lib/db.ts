import initSqlJs, { type Database as SqlJsDatabase } from "sql.js";
import fs from "fs";
import path from "path";

const dbPath = path.resolve(process.cwd(), "data", "snake-lab.db");

let db: SqlJsDatabase | null = null;
let sqlPromise: Promise<SqlJsDatabase> | null = null;

function save() {
  if (!db) return;
  const data = db.export();
  fs.writeFileSync(dbPath, Buffer.from(data));
}

export async function getDb(): Promise<SqlJsDatabase> {
  if (db) return db;
  if (sqlPromise) return sqlPromise;

  sqlPromise = (async () => {
    const SQL = await initSqlJs();

    const dataDir = path.dirname(dbPath);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    if (fs.existsSync(dbPath)) {
      const buffer = fs.readFileSync(dbPath);
      db = new SQL.Database(buffer);
    } else {
      db = new SQL.Database();
    }

    // Create tables if they don't exist
    db.run(`
      CREATE TABLE IF NOT EXISTS orders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        customer_snapshot TEXT NOT NULL,
        shipping_snapshot TEXT NOT NULL,
        items TEXT NOT NULL,
        subtotal REAL NOT NULL,
        total REAL NOT NULL,
        payment_method TEXT NOT NULL,
        idempotency_key TEXT UNIQUE NOT NULL,
        status TEXT DEFAULT 'pending',
        shipping_info TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    db.run(`
      CREATE TABLE IF NOT EXISTS custom_requests (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        code TEXT UNIQUE NOT NULL,
        customer_name TEXT NOT NULL,
        email TEXT NOT NULL,
        notes TEXT,
        files TEXT,
        status TEXT DEFAULT 'recibida',
        quote_amount REAL,
        shipping_info TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    db.run(`
      CREATE TABLE IF NOT EXISTS request_replies (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        request_id INTEGER,
        message TEXT,
        amount REAL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (request_id) REFERENCES custom_requests(id)
      )
    `);

    db.run(`
      CREATE TABLE IF NOT EXISTS categories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    db.run(`
      CREATE TABLE IF NOT EXISTS products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        slug TEXT UNIQUE NOT NULL,
        description TEXT,
        price REAL NOT NULL DEFAULT 0,
        compare_price REAL,
        category_id INTEGER,
        sizes TEXT DEFAULT '[]',
        colors TEXT DEFAULT '[]',
        materials TEXT DEFAULT '["PLA"]',
        images TEXT DEFAULT '[]',
        stock INTEGER DEFAULT 99,
        production_days INTEGER DEFAULT 3,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (category_id) REFERENCES categories(id)
      )
    `);

    save();
    console.log("Database initialized successfully.");
    return db;
  })();

  return sqlPromise;
}

// Helper: run INSERT/UPDATE/DELETE and auto-save
export async function dbRun(sql: string, params: any[] = []) {
  const d = await getDb();
  d.run(sql, params);
  save();
}

// Helper: SELECT multiple rows
export async function dbAll(sql: string, params: any[] = []): Promise<any[]> {
  const d = await getDb();
  const stmt = d.prepare(sql);
  if (params.length > 0) stmt.bind(params);
  const results: any[] = [];
  while (stmt.step()) {
    results.push(stmt.getAsObject());
  }
  stmt.free();
  return results;
}

// Helper: SELECT single row
export async function dbGet(sql: string, params: any[] = []): Promise<any | undefined> {
  const d = await getDb();
  const stmt = d.prepare(sql);
  if (params.length > 0) stmt.bind(params);
  let result: any = undefined;
  if (stmt.step()) {
    result = stmt.getAsObject();
  }
  stmt.free();
  return result;
}

// Helper: get last insert rowid
export async function dbLastId(): Promise<number> {
  const d = await getDb();
  const stmt = d.prepare("SELECT last_insert_rowid() as id");
  stmt.step();
  const row = stmt.getAsObject() as { id: number };
  stmt.free();
  return row.id;
}
