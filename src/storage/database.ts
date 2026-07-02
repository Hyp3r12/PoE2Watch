import Database from "better-sqlite3";
import fs from "node:fs";

if (!fs.existsSync("data")) {
    fs.mkdirSync("data");
}

const db = new Database("data/sales.db");

db.exec(`
CREATE TABLE IF NOT EXISTS sales (
    id TEXT PRIMARY KEY,
    item_name TEXT NOT NULL,
    item_type TEXT NOT NULL,
    icon TEXT,
    price_amount REAL,
    price_currency TEXT,
    sold_at TEXT NOT NULL,
    league TEXT NOT NULL
);
`);

console.log("✓ SQLite database ready.");

export default db;