import db from "../storage/database";
import {
    formatAmount,
    formatConvertedValue,
    formatDiscordTimestamp,
    normalizeCurrency,
    convertValue,
    formatCurrencyName,
    formatEstimateAmount,
} from "./valueformatter";
import { DisplayCurrency, getSettings } from "../storage/settings";
import { getRateProviderLabel } from "./exchange";
import {
    addThumbnail,
    brandEmbed,
    POE2WATCH_INSIGHTS_COLOR,
    POE2WATCH_LEAGUE_COLOR,
    POE2WATCH_MONTH_COLOR,
    POE2WATCH_STATS_COLOR,
    POE2WATCH_TODAY_COLOR,
    POE2WATCH_TOP_COLOR,
    POE2WATCH_WEEK_COLOR,
} from "../discord/theme";
import { formatAnsiRarityText, getRarityColor } from "./rarity";
import { formatItemCard, getItemCardData } from "./itemcard";

export type SaleRow = {
    item_name: string;
    item_type: string;
    item_frame_type?: number | null;
    item_rarity?: string | null;
    icon?: string | null;
    item_json?: string | null;
    price_amount: number;
    price_currency: string;
    sold_at: string;
};

const MAX_FIELD_VALUE_LENGTH = 1024;

function getSalesSince(date: Date): SaleRow[] {
    return db
        .prepare(
            `
      SELECT item_name, item_type, item_frame_type, item_rarity, icon, item_json, price_amount, price_currency, sold_at
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
      SELECT item_name, item_type, item_frame_type, item_rarity, icon, item_json, price_amount, price_currency, sold_at
      FROM sales
      ORDER BY datetime(sold_at) DESC
      `
        )
        .all() as SaleRow[];
}

export function getTopSales(limit: number, currency?: string): SaleRow[] {
    const safeLimit = Math.min(Math.max(limit, 1), 3);
    const normalizedCurrency = currency ? normalizeCurrency(currency) : null;

    if (normalizedCurrency) {
        return db
            .prepare(
                `
        SELECT item_name, item_type, item_frame_type, item_rarity, icon, item_json, price_amount, price_currency, sold_at
        FROM sales
        WHERE lower(price_currency) = ?
        ORDER BY price_amount DESC, datetime(sold_at) DESC
        LIMIT ?
        `
            )
            .all(normalizedCurrency, safeLimit) as SaleRow[];
    }

    const sales = db
        .prepare(
            `
      SELECT item_name, item_type, item_frame_type, item_rarity, icon, item_json, price_amount, price_currency, sold_at
      FROM sales
      ORDER BY datetime(sold_at) DESC
      `
        )
        .all() as SaleRow[];

    return sales
        .map((sale) => ({
            sale,
            estimatedDivineValue: convertValue(sale.price_amount, sale.price_currency, "divine"),
        }))
        .sort((a, b) => {
            const aValue = a.estimatedDivineValue;
            const bValue = b.estimatedDivineValue;

            if (aValue === null && bValue === null) {
                return new Date(b.sale.sold_at).getTime() - new Date(a.sale.sold_at).getTime();
            }

            if (aValue === null) return 1;
            if (bValue === null) return -1;

            return bValue - aValue;
        })
        .slice(0, safeLimit)
        .map((entry) => entry.sale);
}

function truncateField(value: string) {
    if (value.length <= MAX_FIELD_VALUE_LENGTH) return value;

    return `${value.slice(0, MAX_FIELD_VALUE_LENGTH - 20).trimEnd()}\n...and more`;
}

function getCurrencyGroups(sales: SaleRow[]) {
    const totals = new Map<string, { count: number; total: number }>();

    for (const sale of sales) {
        const currency = normalizeCurrency(sale.price_currency);
        const current = totals.get(currency) ?? { count: 0, total: 0 };

        current.count += 1;
        current.total += sale.price_amount;
        totals.set(currency, current);
    }

    return [...totals.entries()]
        .map(([currency, value]) => ({
            currency,
            count: value.count,
            total: value.total,
            average: value.total / value.count,
        }))
        .sort((a, b) => b.total - a.total);
}

function formatProgressBar(value: number, max: number) {
    const width = 12;
    const filled = max > 0 && value > 0 ? Math.max(1, Math.round((value / max) * width)) : 0;

    return `${"█".repeat(filled)}${"░".repeat(width - filled)}`;
}

function formatCurrencyTotals(sales: SaleRow[]) {
    const groups = getCurrencyGroups(sales);

    if (groups.length === 0) return "None";

    const maxTotal = Math.max(...groups.map((group) => group.total));

    return truncateField(
        groups
            .map((group) => {
                return `**${formatCurrencyName(group.currency)}** \`${formatProgressBar(
                    group.total,
                    maxTotal
                )}\`\n\`${formatAmount(
                    group.total
                )} total | ${group.count} sale(s)\``;
            })
            .join("\n\n")
    );
}

function formatCurrencyAverages(sales: SaleRow[]) {
    const groups = getCurrencyGroups(sales);

    if (groups.length === 0) return "None";

    return truncateField(
        groups
            .map((group) => {
                return `**${formatCurrencyName(group.currency)}** \`${formatAmount(group.average)} average\``;
            })
            .join("\n")
    );
}

function getDisplayTargets(displayCurrency: DisplayCurrency) {
    if (displayCurrency === "original") return [];
    if (displayCurrency === "all") return ["chaos", "exalted", "divine"];

    return [displayCurrency];
}

function formatEstimatedTotals(sales: SaleRow[]) {
    const displayCurrency = getSettings().display_currency;
    const targets = getDisplayTargets(displayCurrency);

    if (targets.length === 0) return null;

    return truncateField(
        targets
            .map((target) => {
                let total = 0;
                let convertedCount = 0;
                let missingCount = 0;

                for (const sale of sales) {
                    const converted = convertValue(sale.price_amount, sale.price_currency, target);

                    if (converted === null) {
                        missingCount += 1;
                    } else {
                        total += converted;
                        convertedCount += 1;
                    }
                }

                const missingText = missingCount > 0 ? ` (${missingCount} unavailable)` : "";
                return `**${formatCurrencyName(target)}** \`≈ ${formatEstimateAmount(
                    total
                )} | ${convertedCount} sale(s)${missingText}\``;
            })
            .join("\n")
    );
}

function getLargestSale(sales: SaleRow[]) {
    if (sales.length === 0) return null;

    return [...sales].sort((a, b) => b.price_amount - a.price_amount)[0];
}

export function formatSaleTitle(sale: SaleRow, index?: number) {
    const prefix = typeof index === "number" ? `${index}. ` : "";

    return `${prefix}${sale.item_name}`;
}

export function formatColoredSaleTitle(sale: SaleRow, index?: number) {
    return `\`\`\`ansi\n${formatAnsiRarityText(sale, formatSaleTitle(sale, index))}\n\`\`\``;
}

export function formatSaleDetails(sale: SaleRow) {
    const itemCard = formatItemCard(getItemCardData(sale));

    return `\`\`\`\n${formatConvertedValue(sale)}\n\`\`\`\n${formatDiscordTimestamp(
        sale.sold_at,
        "f"
    )} (${formatDiscordTimestamp(sale.sold_at, "R")})${itemCard ? `\n\n${itemCard}` : ""}`;
}

function formatLargestSaleLine(sale: SaleRow) {
    return `\`\`\`ansi\n${formatAnsiRarityText(sale, sale.item_name)}\n\`\`\`${formatSaleDetails(sale)}`;
}

function getLeagueAgeDays(sales: SaleRow[]) {
    const oldest = [...sales].sort((a, b) => new Date(a.sold_at).getTime() - new Date(b.sold_at).getTime())[0];
    if (!oldest) return 0;

    const ageMs = Date.now() - new Date(oldest.sold_at).getTime();
    return Math.max(1, Math.ceil(ageMs / (24 * 60 * 60 * 1000)));
}

function getEstimatedTotal(sales: SaleRow[], targetCurrency: string) {
    let total = 0;
    let convertedCount = 0;

    for (const sale of sales) {
        const converted = convertValue(sale.price_amount, sale.price_currency, targetCurrency);

        if (converted === null) continue;

        total += converted;
        convertedCount += 1;
    }

    return { total, convertedCount };
}

function getHighestDay(sales: SaleRow[], targetCurrency: string) {
    const totals = new Map<string, number>();

    for (const sale of sales) {
        const converted = convertValue(sale.price_amount, sale.price_currency, targetCurrency);
        if (converted === null) continue;

        const day = new Date(sale.sold_at).toISOString().slice(0, 10);
        totals.set(day, (totals.get(day) ?? 0) + converted);
    }

    return [...totals.entries()].sort((a, b) => b[1] - a[1])[0] ?? null;
}

function getSalesToday(sales: SaleRow[]) {
    const start = new Date();
    start.setHours(0, 0, 0, 0);

    return sales.filter((sale) => new Date(sale.sold_at).getTime() >= start.getTime()).length;
}

function getItemCategory(sale: SaleRow) {
    const itemType = sale.item_type || sale.item_name;
    const words = itemType.trim().split(/\s+/);
    const category = words[words.length - 1] ?? "Unknown";

    return category.endsWith("s") ? category : `${category}s`;
}

function getMostCommonCategory(sales: SaleRow[]) {
    const counts = new Map<string, number>();

    for (const sale of sales) {
        const category = getItemCategory(sale);
        counts.set(category, (counts.get(category) ?? 0) + 1);
    }

    return [...counts.entries()].sort((a, b) => b[1] - a[1])[0] ?? null;
}

function getHighestValueCategory(sales: SaleRow[]) {
    const totals = new Map<string, number>();

    for (const sale of sales) {
        const converted = convertValue(sale.price_amount, sale.price_currency, "divine");
        if (converted === null) continue;

        const category = getItemCategory(sale);
        totals.set(category, (totals.get(category) ?? 0) + converted);
    }

    return [...totals.entries()].sort((a, b) => b[1] - a[1])[0] ?? null;
}

function getBestSellingWeekday(sales: SaleRow[]) {
    const counts = new Map<string, number>();

    for (const sale of sales) {
        const weekday = new Intl.DateTimeFormat("en-US", { weekday: "long" }).format(new Date(sale.sold_at));
        counts.set(weekday, (counts.get(weekday) ?? 0) + 1);
    }

    return [...counts.entries()].sort((a, b) => b[1] - a[1])[0] ?? null;
}

function buildLeagueDashboardFields(sales: SaleRow[]) {
    const leagueAgeDays = getLeagueAgeDays(sales);
    const estimatedDivine = getEstimatedTotal(sales, "divine");
    const highestDay = getHighestDay(sales, "divine");

    return [
        {
            name: "League Age",
            value: `**${leagueAgeDays} day(s)**`,
            inline: true,
        },
        {
            name: "Sales Today",
            value: `**${getSalesToday(sales)}**`,
            inline: true,
        },
        {
            name: "Average Per Day",
            value:
                estimatedDivine.convertedCount > 0
                    ? `**≈ ${formatEstimateAmount(estimatedDivine.total / leagueAgeDays)} Divine**`
                    : "Unavailable",
            inline: true,
        },
        {
            name: "Highest Day",
            value: highestDay
                ? `**${highestDay[0]}**\n≈ ${formatEstimateAmount(highestDay[1])} Divine`
                : "Unavailable",
            inline: true,
        },
    ];
}

function buildSummary(title: string, sales: SaleRow[], color: number, options: { leagueDashboard?: boolean } = {}) {
    if (sales.length === 0) {
        return brandEmbed({
            title,
            description: "No sales found for this period.",
        }, color);
    }

    const largest = getLargestSale(sales);
    const estimatedTotals = formatEstimatedTotals(sales);
    const fields = [
        {
            name: "Sales",
            value: String(sales.length),
            inline: true,
        },
        {
            name: "Largest Sale",
            value: largest ? truncateField(formatLargestSaleLine(largest)) : "None",
            inline: false,
        },
        {
            name: "Totals by Currency",
            value: formatCurrencyTotals(sales),
            inline: false,
        },
        {
            name: "Average Sale by Currency",
            value: formatCurrencyAverages(sales),
            inline: false,
        },
    ];

    if (estimatedTotals) {
        fields.splice(3, 0, {
            name: "Estimated Display Totals",
            value: estimatedTotals,
            inline: false,
        });
    }

    if (options.leagueDashboard) {
        fields.splice(1, 0, ...buildLeagueDashboardFields(sales));
    }

    return addThumbnail(
        brandEmbed(
            {
                title,
                footer: {
                    text: `PoE2Watch | Display: ${getSettings().display_currency} | Estimates: cached ${getRateProviderLabel()}`,
                },
                fields,
            },
            color
        ),
        largest?.icon
    );
}

export function getTodaySummary() {
    const start = new Date();
    start.setHours(0, 0, 0, 0);

    return buildSummary("Today's PoE2 Sales", getSalesSince(start), POE2WATCH_TODAY_COLOR);
}

export function getWeekSummary() {
    const start = new Date();
    start.setDate(start.getDate() - 7);

    return buildSummary("Last 7 Days of PoE2 Sales", getSalesSince(start), POE2WATCH_WEEK_COLOR);
}

export function getMonthSummary() {
    const start = new Date();
    start.setDate(start.getDate() - 30);

    return buildSummary("Last 30 Days of PoE2 Sales", getSalesSince(start), POE2WATCH_MONTH_COLOR);
}

export function getLeagueSummary() {
    return buildSummary("League Sales", getAllSales(), POE2WATCH_LEAGUE_COLOR, { leagueDashboard: true });
}

export function getStatsSummary() {
    return buildSummary("PoE2Watch Stats", getAllSales(), POE2WATCH_STATS_COLOR);
}

export function getInsightsSummary() {
    const sales = getAllSales();

    if (sales.length === 0) {
        return brandEmbed(
            {
                title: "Trading Insights",
                description: "No sales found yet.",
            },
            POE2WATCH_INSIGHTS_COLOR
        );
    }

    const largest = getLargestSale(sales);
    const bestDay = getBestSellingWeekday(sales);
    const mostCommonCategory = getMostCommonCategory(sales);
    const highestCategory = getHighestValueCategory(sales);
    const estimatedDivine = getEstimatedTotal(sales, "divine");

    return addThumbnail(
        brandEmbed(
            {
                title: "Trading Insights",
                description:
                    "**Listing-to-sale time**\nUnavailable until PoE2Watch stores listing timestamps.\n\n────────────",
                fields: [
                    {
                        name: "Best Selling Day",
                        value: bestDay ? `**${bestDay[0]}**\n${bestDay[1]} sale(s)` : "Unavailable",
                        inline: true,
                    },
                    {
                        name: "Most Sold Item Type",
                        value: mostCommonCategory
                            ? `**${mostCommonCategory[0]}**\n${mostCommonCategory[1]} sale(s)`
                            : "Unavailable",
                        inline: true,
                    },
                    {
                        name: "Highest Value Category",
                        value: highestCategory
                            ? `**${highestCategory[0]}**\n≈ ${formatEstimateAmount(highestCategory[1])} Divine`
                            : "Unavailable",
                        inline: true,
                    },
                    {
                        name: "Largest Sale",
                        value: largest ? truncateField(formatLargestSaleLine(largest)) : "Unavailable",
                        inline: false,
                    },
                    {
                        name: "Estimated Wealth Traded",
                        value:
                            estimatedDivine.convertedCount > 0
                                ? `**≈ ${formatEstimateAmount(estimatedDivine.total)} Divine**\n${estimatedDivine.convertedCount} converted sale(s)`
                                : "Unavailable",
                        inline: false,
                    },
                ],
                footer: {
                    text: `PoE2Watch | Insights use cached ${getRateProviderLabel()} when available.`,
                },
            },
            POE2WATCH_INSIGHTS_COLOR
        ),
        largest?.icon
    );
}

export function getSaleDisplayColor(sale?: SaleRow | null) {
    return sale ? getRarityColor(sale) : POE2WATCH_TOP_COLOR;
}
