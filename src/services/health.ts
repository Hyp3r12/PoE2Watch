import db from "../storage/database";
import { getLatestRateFetch } from "../storage/exchangerates";
import { getGoals } from "../storage/goals";
import { getWatcherStatus } from "../watcher";
import { getDisplayLeagueName } from "./league";
import { formatDiscordTimestamp } from "./valueformatter";

type CountRow = {
    count: number;
};

type LatestSaleRow = {
    sold_at: string;
    item_name: string;
} | null;

function ok(value: boolean) {
    return value ? "OK" : "Missing";
}

function countRows(table: string) {
    return (db.prepare(`SELECT COUNT(*) as count FROM ${table}`).get() as CountRow).count;
}

function getLatestSale() {
    return db
        .prepare(
            `
      SELECT item_name, sold_at
      FROM sales
      ORDER BY datetime(sold_at) DESC
      LIMIT 1
      `
        )
        .get() as LatestSaleRow;
}

function formatOptionalTimestamp(value?: string | null) {
    return value ? `${formatDiscordTimestamp(value, "f")} (${formatDiscordTimestamp(value, "R")})` : "Never";
}

function formatDuration(seconds: number) {
    if (seconds <= 0) return "Now";

    const minutes = Math.round(seconds / 60);
    if (minutes < 60) return `${minutes} minute(s)`;

    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours} hour(s)`;
}

function getConfigLines() {
    const extraWebhooks = (process.env.DISCORD_WEBHOOK_URLS ?? "")
        .split(",")
        .map((url) => url.trim())
        .filter(Boolean).length;

    return [
        `Discord webhook: **${ok(!!process.env.DISCORD_WEBHOOK_URL)}**`,
        `Extra webhook mirrors: **${extraWebhooks}**`,
        `Discord bot token: **${ok(!!process.env.DISCORD_BOT_TOKEN)}**`,
        `Discord client ID: **${ok(!!process.env.DISCORD_CLIENT_ID)}**`,
        `Discord guild ID: **${ok(!!process.env.DISCORD_GUILD_ID)}**`,
        `PoE cookie: **${ok(!!process.env.POE_COOKIE)}**`,
        `PoE league: **${process.env.POE_LEAGUE ? getDisplayLeagueName() : "Missing"}**`,
    ];
}

function getDatabaseLines() {
    const saleCount = countRows("sales");
    const goalCount = getGoals().length;
    const latestSale = getLatestSale();

    return [
        "SQLite: **OK**",
        `Tracked sales: **${saleCount}**`,
        `Active goals: **${goalCount}**`,
        latestSale
            ? `Latest sale: **${latestSale.item_name}**\n${formatOptionalTimestamp(latestSale.sold_at)}`
            : "Latest sale: **None yet**",
    ];
}

function getExchangeLines() {
    const latest = getLatestRateFetch();

    return [
        `Rate provider: **${process.env.POE_RATE_PROVIDER || "poe-ninja"}**`,
        `Exchange cache: **${latest?.fetched_at ? "Available" : "Missing"}**`,
        `Last rate refresh: ${formatOptionalTimestamp(latest?.fetched_at)}`,
    ];
}

function getWatcherLines() {
    const watcher = getWatcherStatus();

    return [
        `Mode: **${watcher.mode}**`,
        `Last successful check: ${formatOptionalTimestamp(watcher.lastSuccessAt)}`,
        `Next wait: **${formatDuration(watcher.nextWaitSeconds)}**`,
        watcher.lastError ? `Last issue: **${watcher.lastError}**` : "Last issue: **None**",
    ];
}

export function buildHealthFields() {
    return [
        {
            name: "Configuration",
            value: getConfigLines().join("\n"),
            inline: false,
        },
        {
            name: "Database",
            value: getDatabaseLines().join("\n"),
            inline: false,
        },
        {
            name: "Exchange Rates",
            value: getExchangeLines().join("\n"),
            inline: false,
        },
        {
            name: "Watcher",
            value: getWatcherLines().join("\n"),
            inline: false,
        },
    ];
}
