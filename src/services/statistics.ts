import db from "../storage/database";

type SaleRow = {
    item_name: string;
    item_type: string;
    price_amount: number;
    price_currency: string;
    sold_at: string;
};

function getSalesSince(date: Date): SaleRow[] {
    return db
        .prepare(
            `
      SELECT item_name, item_type, price_amount, price_currency, sold_at
      FROM sales
      WHERE datetime(sold_at) >= datetime(?)
      ORDER BY datetime(sold_at) DESC
      `
        )
        .all(date.toISOString()) as SaleRow[];
}

function getAllSales(): SaleRow[] {
    return db
        .prepare(
            `
      SELECT item_name, item_type, price_amount, price_currency, sold_at
      FROM sales
      ORDER BY datetime(sold_at) DESC
      `
        )
        .all() as SaleRow[];
}

function getCurrencyTotals(sales: SaleRow[]) {
    const totals = new Map<string, number>();

    for (const sale of sales) {
        const currency = sale.price_currency;
        totals.set(currency, (totals.get(currency) ?? 0) + sale.price_amount);
    }

    return [...totals.entries()]
        .sort((a, b) => b[1] - a[1])
        .map(([currency, amount]) => `${amount} ${currency}`)
        .join("\n");
}

function getLargestSale(sales: SaleRow[]) {
    if (sales.length === 0) return null;

    return [...sales].sort((a, b) => b.price_amount - a.price_amount)[0];
}

function buildSummary(title: string, sales: SaleRow[]) {
    if (sales.length === 0) {
        return {
            title,
            description: "No sales found for this period.",
        };
    }

    const largest = getLargestSale(sales);
    const totals = getCurrencyTotals(sales);

    return {
        title,
        fields: [
            {
                name: "Sales",
                value: String(sales.length),
                inline: true,
            },
            {
                name: "Largest Sale",
                value: largest
                    ? `${largest.item_name}\n${largest.price_amount} ${largest.price_currency}`
                    : "None",
                inline: true,
            },
            {
                name: "Currency Totals",
                value: totals || "None",
            },
        ],
    };
}

export function getTodaySummary() {
    const start = new Date();
    start.setHours(0, 0, 0, 0);

    return buildSummary("📈 Today's PoE2 Sales", getSalesSince(start));
}

export function getWeekSummary() {
    const start = new Date();
    start.setDate(start.getDate() - 7);

    return buildSummary("📈 Last 7 Days PoE2 Sales", getSalesSince(start));
}

export function getMonthSummary() {
    const start = new Date();
    start.setDate(start.getDate() - 30);

    return buildSummary("📈 Last 30 Days PoE2 Sales", getSalesSince(start));
}

export function getLeagueSummary() {
    return buildSummary("🏆 League PoE2 Sales", getAllSales());
}

export function getStatsSummary() {
    const sales = getAllSales();

    if (sales.length === 0) {
        return {
            title: "📊 PoE2Watch Stats",
            description: "No sales found yet.",
        };
    }

    const largest = getLargestSale(sales);
    const totals = getCurrencyTotals(sales);

    return {
        title: "📊 PoE2Watch Stats",
        fields: [
            {
                name: "Total Sales",
                value: String(sales.length),
                inline: true,
            },
            {
                name: "Largest Sale",
                value: largest
                    ? `${largest.item_name}\n${largest.price_amount} ${largest.price_currency}`
                    : "None",
                inline: true,
            },
            {
                name: "All-Time Currency Totals",
                value: totals || "None",
            },
        ],
    };
}