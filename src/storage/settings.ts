import db from "./database";

export const DISPLAY_CURRENCIES = ["original", "chaos", "exalted", "divine", "all"] as const;

export type DisplayCurrency = (typeof DISPLAY_CURRENCIES)[number];

export type AppSettings = {
    scope: string;
    display_currency: DisplayCurrency;
    updated_at: string;
};

const DEFAULT_SCOPE = "global";

export function normalizeDisplayCurrency(value: string): DisplayCurrency | null {
    const normalized = value.trim().toLowerCase();

    if (normalized === "exalt") return "exalted";
    if (normalized === "exalts") return "exalted";
    if (normalized === "divines") return "divine";
    if (normalized === "chaoses") return "chaos";

    return DISPLAY_CURRENCIES.includes(normalized as DisplayCurrency)
        ? (normalized as DisplayCurrency)
        : null;
}

export function getSettings(scope = DEFAULT_SCOPE): AppSettings {
    const row = db
        .prepare(
            `
      SELECT scope, display_currency, updated_at
      FROM settings
      WHERE scope = ?
      `
        )
        .get(scope) as AppSettings | undefined;

    if (row) return row;

    return {
        scope,
        display_currency: "original",
        updated_at: new Date(0).toISOString(),
    };
}

export function saveDisplayCurrency(displayCurrency: DisplayCurrency, scope = DEFAULT_SCOPE) {
    db.prepare(
        `
      INSERT INTO settings (scope, display_currency, updated_at)
      VALUES (?, ?, ?)
      ON CONFLICT(scope) DO UPDATE SET
        display_currency = excluded.display_currency,
        updated_at = excluded.updated_at
      `
    ).run(scope, displayCurrency, new Date().toISOString());
}
