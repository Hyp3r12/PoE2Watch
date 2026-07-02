import db from "./database";
import { PoeSale, getItemName, getSaleId } from "../poe/api";

export function hasSale(sale: PoeSale): boolean {
    const id = getSaleId(sale);

    const row = db
        .prepare("SELECT id FROM sales WHERE id = ?")
        .get(id);

    return !!row;
}

export function saveSale(sale: PoeSale) {
    const id = getSaleId(sale);
    const itemName = getItemName(sale);

    db.prepare(`
    INSERT OR IGNORE INTO sales (
      id,
      item_name,
      item_type,
      icon,
      price_amount,
      price_currency,
      sold_at,
      league
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
        id,
        itemName,
        sale.item.typeLine,
        sale.item.icon ?? null,
        sale.price.amount,
        sale.price.currency,
        sale.time,
        process.env.POE_LEAGUE ?? "Unknown"
    );
}

export function getLastSales(limit = 5) {
    return db
        .prepare(`
      SELECT *
      FROM sales
      ORDER BY sold_at DESC
      LIMIT ?
    `)
        .all(limit);
}