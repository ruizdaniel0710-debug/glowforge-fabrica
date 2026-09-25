import initSqlJs from "sql.js";
import fs from "fs";
import path from "path";

const dataDir = path.resolve(process.cwd(), "data");
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.resolve(dataDir, "snake-lab.db");

const SQL = await initSqlJs();
let db;
let isNew = false;

if (fs.existsSync(dbPath)) {
  const buffer = fs.readFileSync(dbPath);
  db = new SQL.Database(buffer);
  console.log("Loaded existing database.");
} else {
  db = new SQL.Database();
  isNew = true;
  console.log("Created new database.");
}

db.run(`CREATE TABLE IF NOT EXISTS orders (
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
)`);

db.run(`CREATE TABLE IF NOT EXISTS custom_requests (
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
)`);

db.run(`CREATE TABLE IF NOT EXISTS request_replies (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  request_id INTEGER,
  message TEXT,
  amount REAL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (request_id) REFERENCES custom_requests(id)
)`);

db.run(`CREATE TABLE IF NOT EXISTS categories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
)`);

db.run(`CREATE TABLE IF NOT EXISTS products (
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
)`);

// Seed products if database is brand new or products table is empty
const countStmt = db.prepare("SELECT COUNT(*) as cnt FROM products");
countStmt.step();
const { cnt } = countStmt.getAsObject();
countStmt.free();

if (cnt === 0) {
  console.log("Seeding products...");

  // Insert categories first
  const categories = ["Tendencia", "Soportes para Controles", "Decoración", "Personalizados"];
  const catIds = {};
  for (const cat of categories) {
    db.run("INSERT OR IGNORE INTO categories (name) VALUES (?)", [cat]);
    const s = db.prepare("SELECT id FROM categories WHERE name = ?");
    s.bind([cat]);
    s.step();
    catIds[cat] = s.getAsObject().id;
    s.free();
  }

  const seedProducts = [
    {
      name: "Flexi Animals",
      slug: "flexi-animals",
      description: "**Flexi Animals** es una colección de adorables animales articulados y flexibles, pensados para jugar, coleccionar y regalar.",
      price: 6000,
      compare_price: 10000,
      category: "Tendencia",
      images: ["/uploads/images/cover_image-1788283929064-462217625.jpg", "/uploads/images/images-1788283479368-430813442.jpg"],
      colors: ["#808080", "#c4a35a", "#1a1a2e", "#ff5f57"],
      sizes: ["10cm", "15cm", "20cm", "30cm"],
      materials: ["PLA"],
      production_days: 4,
    },
    {
      name: "Soporte para Mandos PS5 - XBOX",
      slug: "soporte-para-mandos-ps5-xbox",
      description: "**Soportes para Mandos PS5 y Xbox** diseñados para mantener tus controles organizados, seguros y siempre a la mano.",
      price: 30000,
      compare_price: 60000,
      category: "Soportes para Controles",
      images: ["/uploads/images/cover_image-1789499680778-774100578.jpg", "/uploads/images/images-1789499681569-472731152.jpg", "/uploads/images/images-1789499681691-499192089.jpg", "/uploads/images/images-1789499681779-919773570.jpg", "/uploads/images/images-1789499681825-949358512.jpg", "/uploads/images/images-1789499681898-288281121.jpg"],
      colors: ["#e53935", "#1565c0", "#000000"],
      sizes: ["Estándar"],
      materials: ["PLA"],
      production_days: 4,
    },
    {
      name: "Figuras estilo crochet",
      slug: "figuras-estilo-crochet",
      description: "Figuras con un acabado especial que imita el tejido de crochet, combinando la precisión de la impresión 3D con un look artesanal.",
      price: 55000,
      compare_price: 70000,
      category: "Tendencia",
      images: ["/uploads/images/cover_image-1789500289203-967354465.jpg", "/uploads/images/images-1789500289315-194773776.jpg", "/uploads/images/images-1789500289358-8930894.jpg", "/uploads/images/images-1789500289415-99380394.jpg", "/uploads/images/images-1789500289454-34106740.jpg", "/uploads/images/images-1789500289499-595147197.jpg"],
      colors: ["#fdd835", "#ffffff"],
      sizes: ["12cm", "15cm", "20cm"],
      materials: ["PLA"],
      production_days: 3,
    },
    {
      name: "Pato Verso",
      slug: "pato-verso",
      description: "Una serie de patos coleccionables únicos en su estilo, impresos en alta calidad para decorar cualquier espacio.",
      price: 70000,
      compare_price: 90000,
      category: "Tendencia",
      images: ["/uploads/images/images-1789501359680-519572941.jpg", "/uploads/images/images-1789501359543-643301763.jpg", "/uploads/images/images-1789501359745-211558234.jpg", "/uploads/images/images-1789501359772-793551024.jpg", "/uploads/images/images-1789501359810-548197441.jpg"],
      colors: ["#ff9800", "#000000", "#ffffff"],
      sizes: ["10cm", "15cm", "20cm"],
      materials: ["PLA", "Resina"],
      production_days: 4,
    },
    {
      name: "Clickers",
      slug: "clickers",
      description: "Figuras hiperrealistas inspiradas en los infectados Clickers, con texturas y formas que replican los detalles escalofriantes.",
      price: 35000,
      compare_price: 45000,
      category: "Tendencia",
      images: ["/uploads/images/cover_image-1789499887434-656579980.jpg", "/uploads/images/images-1789499887473-549896768.jpg", "/uploads/images/images-1789499887524-547486980.jpg", "/uploads/images/images-1789499887570-110345139.jpg"],
      colors: ["#e53935", "#7b1fa2", "#00bcd4", "#4caf50", "#ff9800", "#212121"],
      sizes: ["15cm", "25cm", "40cm"],
      materials: ["PLA"],
      production_days: 2,
    },
    {
      name: "Porta Vasos/Latas",
      slug: "porta-vasos-latas",
      description: "Portavasos con diseños únicos para mantener tus bebidas seguras y darle estilo a tu mesa.",
      price: 40000,
      compare_price: 55000,
      category: "Decoración",
      images: ["/uploads/images/cover_image-1789501887196-304273610.jpg", "/uploads/images/images-1789501887248-917784353.jpg", "/uploads/images/images-1789501887285-342221849.jpg", "/uploads/images/images-1789501887352-364896044.jpg", "/uploads/images/images-1789501887406-106717595.jpg"],
      colors: ["#795548", "#4caf50", "#8d6e63"],
      sizes: ["10cm", "15cm"],
      materials: ["PLA"],
      production_days: 3,
    },
    {
      name: "Tu Diseño Personalizado",
      slug: "tu-diseno-personalizado",
      description: "Envíanos tu idea o archivo 3D y lo hacemos realidad. Cotización según complejidad y tamaño.",
      price: 50000,
      compare_price: null,
      category: "Personalizados",
      images: ["/uploads/images/custom.jpg"],
      colors: ["#9c27b0", "#00bcd4", "#ff5722", "#4caf50"],
      sizes: ["Según diseño"],
      materials: ["PLA", "PETG", "Resina", "TPU"],
      production_days: 7,
    },
  ];

  for (const p of seedProducts) {
    db.run(
      `INSERT INTO products (name, slug, description, price, compare_price, category_id, sizes, colors, materials, images, stock, production_days)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        p.name,
        p.slug,
        p.description,
        p.price,
        p.compare_price,
        catIds[p.category] || null,
        JSON.stringify(p.sizes),
        JSON.stringify(p.colors),
        JSON.stringify(p.materials),
        JSON.stringify(p.images),
        99,
        p.production_days,
      ]
    );
  }
  console.log(`Seeded ${seedProducts.length} products.`);
}

const data = db.export();
fs.writeFileSync(dbPath, Buffer.from(data));
console.log("Database initialized and saved to", dbPath);
