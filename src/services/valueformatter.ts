import { DisplayCurrency, getSettings } from "../storage/settings";
import { getExchangeRate } from "../storage/exchangerates";

export type SaleValue = {
    item_name?: string;
    price_amount: number;
    price_currency: string;
    sold_at?: string;
};

const TARGET_CURRENCIES: DisplayCurrency[] = ["chaos", "exalted", "divine"];

export function formatAmount(amount: number) {
    return Number.isInteger(amount)
        ? String(amount)
        : amount.toFixed(2).replace(/\.?0+$/, "");
}

export function formatEstimateAmount(amount: number) {
    return amount >= 10 ? amount.toFixed(1).replace(/\.0$/, "") : formatAmount(amount);
}

export function normalizeCurrency(currency: string) {
    const normalized = currency.trim().toLowerCase();

    if (normalized === "chaos orb" || normalized === "chaos orbs") return "chaos";
    if (normalized === "exalted orb" || normalized === "exalted orbs") return "exalted";
    if (normalized === "divine orb" || normalized === "divine orbs") return "divine";
    if (normalized === "exalt" || normalized === "exalts") return "exalted";
    if (normalized === "divines") return "divine";
    if (normalized === "chaoses") return "chaos";

    return normalized;
}

export function formatCurrencyName(currency: string) {
    const normalized = normalizeCurrency(currency);

    if (normalized === "chaos") return "Chaos";
    if (normalized === "exalted") return "Exalted";
    if (normalized === "divine") return "Divine";

    return normalized
        .split(/[\s-]+/)
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
}

export function formatPrice(amount: number, currency: string) {
    return `${formatAmount(amount)} ${formatCurrencyName(currency)}`;
}

export function convertValue(amount: number, fromCurrency: string, toCurrency: string) {
    const from = normalizeCurrency(fromCurrency);
    const to = normalizeCurrency(toCurrency);

    if (from === to) return amount;

    const rate = getExchangeRate(from, to);
    if (!rate) return null;

    return amount * rate.rate;
}

export function formatConvertedValue(sale: SaleValue, displayCurrency = getSettings().display_currency) {
    const originalCurrency = normalizeCurrency(sale.price_currency);

    if (displayCurrency === "original") {
        return formatPrice(sale.price_amount, sale.price_currency);
    }

    const targets = displayCurrency === "all" ? TARGET_CURRENCIES : [displayCurrency];

    const lines = [formatPrice(sale.price_amount, sale.price_currency)];

    for (const target of targets) {
        if (target === originalCurrency) continue;

        const converted = convertValue(sale.price_amount, originalCurrency, target);

        if (converted === null) {
            lines.push(`≈ unavailable ${formatCurrencyName(target)}`);
        } else {
            lines.push(`≈ ${formatEstimateAmount(converted)} ${formatCurrencyName(target)}`);
        }
    }

    return lines.join("\n");
}

export function formatDiscordTimestamp(value: string, style: "f" | "R" = "f") {
    const time = new Date(value).getTime();

    if (!Number.isFinite(time)) {
        return value;
    }

    return `<t:${Math.floor(time / 1000)}:${style}>`;
}
