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

CREATE TABLE IF NOT EXISTS settings (
    scope TEXT PRIMARY KEY,
    display_currency TEXT NOT NULL DEFAULT 'original',
    updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS exchange_rates (
    league TEXT NOT NULL,
    from_currency TEXT NOT NULL,
    to_currency TEXT NOT NULL,
    rate REAL NOT NULL,
    source_timestamp INTEGER NOT NULL,
    fetched_at TEXT NOT NULL,
    PRIMARY KEY (league, from_currency, to_currency)
);
`);

console.log("✓ SQLite database ready.");

export default db;
