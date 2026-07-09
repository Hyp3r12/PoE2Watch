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

type TableInfoRow = {
    name: string;
};

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

function yesNo(value: boolean) {
    return value ? "yes" : "no";
}

function sanitizeError(value?: string | null) {
    if (!value) return "none";

    if (value.toLowerCase().includes("auth")) return "auth";
    if (value.toLowerCase().includes("rate")) return "rate-limit";
    if (value.includes("429")) return "rate-limit";
    if (value.includes("401") || value.includes("403")) return "auth";
    if (value.includes("502") || value.includes("503") || value.includes("504")) return "trade-site-unavailable";
    if (value.startsWith("DISCORD_WEBHOOK_ERROR")) return "discord-webhook";

    return "runtime-error";
}

function getRuntimeMode() {
    if (process.env.POE2WATCH_RUNTIME) return process.env.POE2WATCH_RUNTIME;
    if (process.env.NODE_ENV === "production") return "production";

    return "local";
}

function getAppVersion() {
    return process.env.npm_package_version ?? "0.5.0-alpha";
}

function getDatabaseStatus() {
    try {
        const integrity = db.pragma("quick_check", { simple: true });
        const tables = (db
            .prepare(
                `
      SELECT name
      FROM sqlite_master
      WHERE type = 'table'
      ORDER BY name
      `
            )
            .all() as TableInfoRow[]).map((table) => table.name);

        return {
            ok: integrity === "ok",
            integrity: String(integrity),
            tables,
        };
    } catch (error) {
        return {
            ok: false,
            integrity: sanitizeError(error instanceof Error ? error.message : String(error)),
            tables: [] as string[],
        };
    }
}

function countRowsSafely(table: string) {
    try {
        return countRows(table);
    } catch {
        return null;
    }
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

export function buildHealthExport() {
    const watcher = getWatcherStatus();
    const latestRate = getLatestRateFetch();
    const latestSale = getLatestSale();
    const database = getDatabaseStatus();
    const extraWebhooks = (process.env.DISCORD_WEBHOOK_URLS ?? "")
        .split(",")
        .map((url) => url.trim())
        .filter(Boolean).length;
    const lines = [
        "PoE2Watch Diagnostics Export",
        "Generated by /health export",
        "Safe to paste publicly after reviewing. No cookies, tokens, webhook URLs, or session IDs are included.",
        "",
        "[App]",
        `version=${getAppVersion()}`,
        `node=${process.version}`,
        `runtime=${getRuntimeMode()}`,
        `platform=${process.platform}`,
        "",
        "[Configuration]",
        `discord_webhook_configured=${yesNo(!!process.env.DISCORD_WEBHOOK_URL)}`,
        `discord_extra_webhooks=${extraWebhooks}`,
        `discord_bot_token_configured=${yesNo(!!process.env.DISCORD_BOT_TOKEN)}`,
        `discord_client_id_configured=${yesNo(!!process.env.DISCORD_CLIENT_ID)}`,
        `discord_guild_id_configured=${yesNo(!!process.env.DISCORD_GUILD_ID)}`,
        `poe_cookie_configured=${yesNo(!!process.env.POE_COOKIE)}`,
        `poe_league_configured=${yesNo(!!process.env.POE_LEAGUE)}`,
        `poe_league_display=${process.env.POE_LEAGUE ? getDisplayLeagueName() : "missing"}`,
        `rate_provider=${process.env.POE_RATE_PROVIDER || "poe-ninja"}`,
        "",
        "[Database]",
        `sqlite_ok=${yesNo(database.ok)}`,
        `sqlite_quick_check=${database.integrity}`,
        `tables=${database.tables.join(",") || "none"}`,
        `sales_count=${countRowsSafely("sales") ?? "unavailable"}`,
        `goals_count=${getGoals().length}`,
        `completed_goals_count=${countRowsSafely("completed_goals") ?? "unavailable"}`,
        latestSale ? `latest_sale_at=${latestSale.sold_at}` : "latest_sale_at=none",
        "",
        "[Exchange]",
        `cache_available=${yesNo(!!latestRate?.fetched_at)}`,
        `last_rate_refresh=${latestRate?.fetched_at ?? "never"}`,
        "",
        "[Watcher]",
        `mode=${watcher.mode}`,
        `last_check_at=${watcher.lastCheckAt ?? "never"}`,
        `last_success_at=${watcher.lastSuccessAt ?? "never"}`,
        `next_wait_seconds=${watcher.nextWaitSeconds}`,
        `last_error_category=${sanitizeError(watcher.lastError)}`,
        "",
        "[Reminder]",
        "Do not attach .env, data/sales.db, seen-sales.json, cookies, tokens, webhook URLs, or raw request headers to public issues.",
    ];

    return `${lines.join("\n")}\n`;
}
