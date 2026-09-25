import Database from "better-sqlite3";
import fs from "fs";
import path from "path";

const dataDir = path.resolve(process.cwd(), "data");
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.resolve(dataDir, "snake-lab.db");
const db = new Database(dbPath);

db.exec(`
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
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
  
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
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);
console.log("Database initialized correctly.");
