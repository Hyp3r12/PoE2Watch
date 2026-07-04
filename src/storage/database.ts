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
    item_frame_type INTEGER,
    item_rarity TEXT,
    icon TEXT,
    item_json TEXT,
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

CREATE TABLE IF NOT EXISTS goals (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    scope TEXT NOT NULL,
    name TEXT NOT NULL,
    target_amount REAL NOT NULL,
    target_currency TEXT NOT NULL,
    priority INTEGER NOT NULL,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS completed_goals (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    scope TEXT NOT NULL,
    name TEXT NOT NULL,
    target_amount REAL NOT NULL,
    target_currency TEXT NOT NULL,
    completed_at TEXT NOT NULL
);
`);

const goalColumns = db.pragma("table_info(goals)") as Array<{ name: string }>;
const goalColumnNames = new Set(goalColumns.map((column) => column.name));

if (!goalColumnNames.has("id") || !goalColumnNames.has("priority")) {
    db.exec(`
    ALTER TABLE goals RENAME TO goals_old;

    CREATE TABLE goals (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        scope TEXT NOT NULL,
        name TEXT NOT NULL,
        target_amount REAL NOT NULL,
        target_currency TEXT NOT NULL,
        priority INTEGER NOT NULL,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
    );

    INSERT INTO goals (scope, name, target_amount, target_currency, priority, created_at, updated_at)
    SELECT scope, name, target_amount, target_currency, 1, created_at, updated_at
    FROM goals_old;

    DROP TABLE goals_old;
    `);
}

const saleColumns = db.pragma("table_info(sales)") as Array<{ name: string }>;
const saleColumnNames = new Set(saleColumns.map((column) => column.name));

if (!saleColumnNames.has("item_frame_type")) {
    db.exec("ALTER TABLE sales ADD COLUMN item_frame_type INTEGER;");
}

if (!saleColumnNames.has("item_rarity")) {
    db.exec("ALTER TABLE sales ADD COLUMN item_rarity TEXT;");
}

if (!saleColumnNames.has("item_json")) {
    db.exec("ALTER TABLE sales ADD COLUMN item_json TEXT;");
}

console.log("✓ SQLite database ready.");

export default db;
