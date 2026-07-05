import db from "../storage/database";
import { normalizeCurrency } from "./valueformatter";
import { SaleRow } from "./statistics";

type HistorySearchOptions = {
    query: string;
    limit: number;
    currency?: string | null;
    days?: number | null;
};

function escapeLike(value: string) {
    return value.replace(/[\\%_]/g, (match) => `\\${match}`);
}

export function searchSalesHistory(options: HistorySearchOptions): SaleRow[] {
    const safeLimit = Math.min(Math.max(options.limit, 1), 3);
    const query = options.query.trim();
    const filters = ["(lower(item_name) LIKE ? ESCAPE '\\' OR lower(item_type) LIKE ? ESCAPE '\\')"];
    const params: unknown[] = [];
    const likeQuery = `%${escapeLike(query.toLowerCase())}%`;

    params.push(likeQuery, likeQuery);

    if (options.currency) {
        filters.push("lower(price_currency) = ?");
        params.push(normalizeCurrency(options.currency));
    }

    if (options.days && options.days > 0) {
        const since = new Date();
        since.setDate(since.getDate() - options.days);
        filters.push("datetime(sold_at) >= datetime(?)");
        params.push(since.toISOString());
    }

    params.push(safeLimit);

    return db
        .prepare(
            `
      SELECT item_name, item_type, item_frame_type, item_rarity, icon, item_json, price_amount, price_currency, sold_at
      FROM sales
      WHERE ${filters.join(" AND ")}
      ORDER BY datetime(sold_at) DESC
      LIMIT ?
      `
        )
        .all(...params) as SaleRow[];
}
