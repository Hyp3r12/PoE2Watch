import "dotenv/config";
import { getLatestRateFetch, saveExchangeRate } from "../storage/exchangerates";
import { normalizeCurrency } from "./valueformatter";
import { formatLeagueName } from "./league";

const ONE_HOUR_MS = 60 * 60 * 1000;
const POE_NINJA_REFRESH_INTERVAL_MS = 12 * ONE_HOUR_MS;
const ESTIMATE_CURRENCIES = ["chaos", "exalted", "divine"];

type RateProvider = "poe-ninja" | "ggg";

type RefreshResult = {
    refreshed: boolean;
    reason: string;
    savedMarkets: number;
    provider: RateProvider;
};

type GggExchangeMarket = {
    league: string;
    market_id: string;
    lowest_ratio?: Record<string, number>;
    highest_ratio?: Record<string, number>;
};

type GggExchangeResponse = {
    next_change_id: number;
    markets: GggExchangeMarket[];
};

type PoeNinjaCurrencyLine = {
    id?: string;
    currencyTypeName: string;
    name?: string;
    chaosEquivalent?: number;
    chaosValue?: number;
    value?: number;
    primaryValue?: number;
};

type PoeNinjaCurrencyResponse = {
    core?: {
        primary?: string;
        rates?: Record<string, number>;
    };
    lines?: PoeNinjaCurrencyLine[];
    entries?: PoeNinjaCurrencyLine[];
};

function getProvider(): RateProvider {
    return process.env.POE_RATE_PROVIDER === "ggg" ? "ggg" : "poe-ninja";
}

export function getRateProviderLabel() {
    return getProvider() === "ggg" ? "official GGG exchange data" : "poe.ninja market data";
}

function shouldRefreshRates(refreshIntervalMs = ONE_HOUR_MS) {
    const latest = getLatestRateFetch();

    if (!latest?.fetched_at) return true;

    return Date.now() - new Date(latest.fetched_at).getTime() >= refreshIntervalMs;
}

function getLeagueSlug() {
    if (process.env.POE_NINJA_LEAGUE_SLUG) {
        return process.env.POE_NINJA_LEAGUE_SLUG;
    }

    return (process.env.POE_LEAGUE ?? "Runes of Aldur").toLowerCase().replace(/[^a-z0-9]/g, "");
}

function getPoeNinjaLeagueName() {
    return process.env.POE_NINJA_LEAGUE_NAME ?? formatLeagueName(process.env.POE_LEAGUE ?? "Runes of Aldur");
}

function getPoeNinjaUrls() {
    if (process.env.POE_NINJA_CURRENCY_API_URL) {
        return [process.env.POE_NINJA_CURRENCY_API_URL];
    }

    const league = getPoeNinjaLeagueName();
    const encodedLeague = encodeURIComponent(league);
    const slug = getLeagueSlug();

    return [
        `https://poe.ninja/poe2/api/economy/exchange/current/overview?league=${encodedLeague}&type=Currency`,
        `https://poe.ninja/api/data/currencyoverview?league=${encodedLeague}&type=Currency&language=en&game=poe2`,
        `https://poe.ninja/api/data/currencyoverview?league=${encodedLeague}&type=Currency&language=en`,
        `https://poe.ninja/poe2/api/data/currencyoverview?league=${encodedLeague}&type=Currency&language=en`,
        `https://poe.ninja/poe2/economy/${slug}/currency`,
    ];
}

function saveChaosAnchoredRates(currency: string, chaosEquivalent: number, sourceTimestamp: number) {
    if (chaosEquivalent <= 0) return;

    const normalizedCurrency = normalizeCurrency(currency);
    const league = process.env.POE_LEAGUE ?? "Unknown";

    saveExchangeRate(normalizedCurrency, "chaos", chaosEquivalent, sourceTimestamp, league);
    saveExchangeRate("chaos", normalizedCurrency, 1 / chaosEquivalent, sourceTimestamp, league);
}

function saveCrossRates(chaosValues: Map<string, number>, sourceTimestamp: number) {
    const league = process.env.POE_LEAGUE ?? "Unknown";

    for (const from of ESTIMATE_CURRENCIES) {
        const fromChaos = chaosValues.get(from);
        if (!fromChaos) continue;

        for (const to of ESTIMATE_CURRENCIES) {
            const toChaos = chaosValues.get(to);
            if (!toChaos || from === to) continue;

            saveExchangeRate(from, to, fromChaos / toChaos, sourceTimestamp, league);
        }
    }
}

async function fetchPoeNinjaCurrencyData() {
    const urls = getPoeNinjaUrls();
    let lastError = "No poe.ninja URL was attempted.";

    for (const url of urls) {
        const response = await fetch(url, {
            headers: {
                Accept: "application/json,text/html;q=0.9,*/*;q=0.8",
                "User-Agent": "PoE2Watch/0.4 third-party estimate cache; contact: local",
            },
        });

        if (!response.ok) {
            lastError = `poe.ninja returned ${response.status} for ${url}`;
            continue;
        }

        const text = await response.text();

        try {
            return JSON.parse(text) as PoeNinjaCurrencyResponse;
        } catch {
            lastError = `poe.ninja response was not JSON for ${url}`;
        }
    }

    throw new Error(`POE_NINJA_ERROR:${lastError}`);
}

async function refreshPoeNinjaRates(options: { force?: boolean }): Promise<RefreshResult> {
    if (!options.force && !shouldRefreshRates(POE_NINJA_REFRESH_INTERVAL_MS)) {
        return {
            refreshed: false,
            reason: "poe.ninja estimates were refreshed less than 12 hours ago.",
            savedMarkets: 0,
            provider: "poe-ninja",
        };
    }

    const data = await fetchPoeNinjaCurrencyData();
    const sourceTimestamp = Math.floor(Date.now() / 1000);
    const chaosValues = new Map<string, number>([["chaos", 1]]);
    const primaryCurrency = normalizeCurrency(data.core?.primary ?? "chaos");
    const chaosPerPrimary =
        primaryCurrency === "chaos" ? 1 : data.core?.rates?.chaos ?? data.core?.rates?.["chaos orb"];
    let savedMarkets = 0;

    for (const line of data.lines ?? data.entries ?? []) {
        const currencyName = line.currencyTypeName ?? line.name ?? line.id;
        let chaosEquivalent = line.chaosEquivalent ?? line.chaosValue ?? line.value;

        if (typeof chaosEquivalent !== "number" && typeof line.primaryValue === "number") {
            if (currencyName && normalizeCurrency(currencyName) === "chaos") {
                chaosEquivalent = 1;
            } else if (typeof chaosPerPrimary === "number") {
                chaosEquivalent = line.primaryValue * chaosPerPrimary;
            }
        }

        if (!currencyName || typeof chaosEquivalent !== "number") continue;

        const currency = normalizeCurrency(currencyName);
        saveChaosAnchoredRates(currency, chaosEquivalent, sourceTimestamp);
        chaosValues.set(currency, chaosEquivalent);
        savedMarkets += 1;
    }

    saveCrossRates(chaosValues, sourceTimestamp);

    return {
        refreshed: true,
        reason: "Exchange rates refreshed from cached poe.ninja market data.",
        savedMarkets,
        provider: "poe-ninja",
    };
}

function getGggRatio(market: GggExchangeMarket, fromCurrency: string, toCurrency: string) {
    const lowest = market.lowest_ratio?.[fromCurrency];
    const highest = market.highest_ratio?.[fromCurrency];
    const direct = lowest ?? highest;

    if (typeof direct === "number" && direct > 0) {
        return direct;
    }

    const inverseLowest = market.lowest_ratio?.[toCurrency];
    const inverseHighest = market.highest_ratio?.[toCurrency];
    const inverse = inverseLowest ?? inverseHighest;

    if (typeof inverse === "number" && inverse > 0) {
        return 1 / inverse;
    }

    return null;
}

function saveGggMarketRates(market: GggExchangeMarket, sourceTimestamp: number) {
    const [rawFrom, rawTo] = market.market_id.split("|");
    if (!rawFrom || !rawTo) return;

    const from = normalizeCurrency(rawFrom);
    const to = normalizeCurrency(rawTo);
    const forwardRate = getGggRatio(market, from, to);
    const reverseRate = getGggRatio(market, to, from);

    if (forwardRate !== null) {
        saveExchangeRate(from, to, forwardRate, sourceTimestamp, market.league);
    }

    if (reverseRate !== null) {
        saveExchangeRate(to, from, reverseRate, sourceTimestamp, market.league);
    }
}

async function refreshGggRates(options: { force?: boolean }): Promise<RefreshResult> {
    const enabled = process.env.POE_EXPERIMENTAL_OAUTH_EXCHANGE === "true";
    const token = process.env.POE_OAUTH_TOKEN;
    const clientId = process.env.POE_OAUTH_CLIENT_ID ?? "poe2watch";
    const contact = process.env.POE_CONTACT_EMAIL ?? "local";

    if (!enabled) {
        return {
            refreshed: false,
            reason:
                "Official OAuth exchange refresh is a placeholder until GGG app registration is confirmed. Set POE_EXPERIMENTAL_OAUTH_EXCHANGE=true only for approved testing.",
            savedMarkets: 0,
            provider: "ggg",
        };
    }

    if (!token) {
        return {
            refreshed: false,
            reason: "POE_OAUTH_TOKEN is not configured for experimental approved testing.",
            savedMarkets: 0,
            provider: "ggg",
        };
    }

    if (!options.force && !shouldRefreshRates()) {
        return {
            refreshed: false,
            reason: "Exchange rates were refreshed less than an hour ago.",
            savedMarkets: 0,
            provider: "ggg",
        };
    }

    const latestCompletedHour = Math.floor((Date.now() - ONE_HOUR_MS) / ONE_HOUR_MS) * 60 * 60;
    const response = await fetch(`https://api.pathofexile.com/currency-exchange/poe2/${latestCompletedHour}`, {
        headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
            "User-Agent": `OAuth ${clientId}/0.4.0 (contact: ${contact}) PoE2Watch`,
        },
    });

    if (response.status === 429) {
        const retryAfter = response.headers.get("retry-after");
        throw new Error(`RATE_LIMIT:${retryAfter ?? "3600"}`);
    }

    if (response.status === 401 || response.status === 403) {
        throw new Error(`AUTH_FAILED:${response.status}`);
    }

    if (!response.ok) {
        throw new Error(`EXCHANGE_ERROR:${response.status}`);
    }

    const data = (await response.json()) as GggExchangeResponse;
    let savedMarkets = 0;

    for (const market of data.markets ?? []) {
        if (market.league !== process.env.POE_LEAGUE) continue;

        saveGggMarketRates(market, data.next_change_id);
        savedMarkets += 1;
    }

    return {
        refreshed: true,
        reason: "Exchange rates refreshed from the latest available official hourly digest.",
        savedMarkets,
        provider: "ggg",
    };
}

export async function refreshExchangeRates(options: { force?: boolean } = {}) {
    return getProvider() === "ggg" ? refreshGggRates(options) : refreshPoeNinjaRates(options);
}
