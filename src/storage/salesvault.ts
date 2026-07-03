import db from "./database";
import { PoeSale, getItemFrameType, getItemName, getSaleId } from "../poe/api";
import { getRarityFromFrameType } from "../services/rarity";

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
      item_frame_type,
      item_rarity,
      icon,
      price_amount,
      price_currency,
      sold_at,
      league
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
        id,
        itemName,
        sale.item.typeLine,
        getItemFrameType(sale) ?? null,
        sale.item.rarity ?? getRarityFromFrameType(getItemFrameType(sale)),
        sale.item.icon ?? null,
        sale.price.amount,
        sale.price.currency,
        sale.time,
        process.env.POE_LEAGUE ?? "Unknown"
    );
}

export function updateSaleMetadata(sale: PoeSale) {
    const id = getSaleId(sale);

    db.prepare(
        `
      UPDATE sales
      SET
        item_frame_type = COALESCE(item_frame_type, ?),
        item_rarity = CASE
          WHEN item_rarity IS NULL OR item_rarity = 'unknown' THEN ?
          ELSE item_rarity
        END,
        icon = COALESCE(icon, ?)
      WHERE id = ?
      `
    ).run(
        getItemFrameType(sale) ?? null,
        sale.item.rarity ?? getRarityFromFrameType(getItemFrameType(sale)),
        sale.item.icon ?? null,
        id
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
