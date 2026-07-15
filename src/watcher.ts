import { fetchSales, getItemName, PoeSale } from "./poe/api";
import { notifyDiscord } from "./discord/webhook";
import { hasSale, saveSale, getLastSales, updateSaleMetadata } from "./storage/salesvault";
import { refreshExchangeRates } from "./services/exchange";
import { AuthFailedError, RateLimitError } from "./services/httpErrors";

const FAST_WAIT_SECONDS = 7 * 60; // 7 minutes
const IDLE_WAIT_SECONDS = 20 * 60; // 20 minutes
const RECENT_SALE_WINDOW_MS = 60 * 60 * 1000; // 1 hour

let nextWaitSeconds = IDLE_WAIT_SECONDS;
let watcherStatus = {
    lastCheckAt: null as string | null,
    lastSuccessAt: null as string | null,
    lastError: null as string | null,
    mode: "STARTING",
    nextWaitSeconds,
};

function sleep(seconds: number) {
    return new Promise((resolve) => setTimeout(resolve, seconds * 1000));
}

function getPollingMode() {
    const latestSale = getLastSales(1)[0] as any;

    if (!latestSale) {
        return {
            mode: "IDLE",
            waitSeconds: IDLE_WAIT_SECONDS,
        };
    }

    const latestSaleTime = new Date(latestSale.sold_at).getTime();
    const saleAgeMs = Date.now() - latestSaleTime;

    if (saleAgeMs <= RECENT_SALE_WINDOW_MS) {
        return {
            mode: "FAST",
            waitSeconds: FAST_WAIT_SECONDS,
        };
    }

    return {
        mode: "IDLE",
        waitSeconds: IDLE_WAIT_SECONDS,
    };
}

async function checkForNewSales() {
    const sales = await fetchSales();

    const databaseWasEmpty = getLastSales(1).length === 0;
    const newSales: PoeSale[] = [];

    for (const sale of [...sales].reverse()) {
        if (hasSale(sale)) {
            updateSaleMetadata(sale);
        } else {
            saveSale(sale);
            newSales.push(sale);
        }
    }

    if (databaseWasEmpty) {
        console.log(`Initialized SQLite. Imported ${newSales.length} existing sales silently.`);
        return;
    }

    if (newSales.length === 0) {
        console.log(`[${new Date().toLocaleTimeString()}] No new sales.`);
        return;
    }

    console.log(`Found ${newSales.length} new sale(s).`);

    for (const sale of newSales) {
        await notifyDiscord(sale);
        console.log(`Sent: ${getItemName(sale)} - ${sale.price.amount} ${sale.price.currency}`);
    }
}

async function refreshExchangeRatesIfNeeded() {
    try {
        const result = await refreshExchangeRates();

        if (result.refreshed) {
            console.log(`Refreshed ${result.savedMarkets} exchange market(s) from ${result.provider}.`);
        }
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        console.log(`Exchange rate refresh skipped: ${message}`);
    }
}

export async function startWatcher() {
    console.log("Adaptive watcher enabled");
    console.log("FAST mode: 7 minutes after recent sales");
    console.log("IDLE mode: 20 minutes after 1 hour without sales");

    while (true) {
        try {
            await refreshExchangeRatesIfNeeded();
            await checkForNewSales();

            const polling = getPollingMode();
            nextWaitSeconds = polling.waitSeconds;
            watcherStatus = {
                lastCheckAt: new Date().toISOString(),
                lastSuccessAt: new Date().toISOString(),
                lastError: null,
                mode: polling.mode,
                nextWaitSeconds,
            };

            console.log(
                `[${new Date().toLocaleTimeString()}] Mode: ${polling.mode}. Next check in ${Math.round(
                    nextWaitSeconds / 60
                )} minutes.`
            );
        } catch (error) {
            const message = error instanceof Error ? error.message : String(error);

            if (error instanceof RateLimitError) {
                nextWaitSeconds = error.retryAfterSeconds;
                watcherStatus = {
                    ...watcherStatus,
                    lastCheckAt: new Date().toISOString(),
                    lastError: "Rate limited",
                    mode: "RATE_LIMITED",
                    nextWaitSeconds,
                };
                console.log(`Rate limited. Waiting ${Math.round(nextWaitSeconds / 60)} minutes.`);
            } else if (error instanceof AuthFailedError) {
                watcherStatus = {
                    ...watcherStatus,
                    lastCheckAt: new Date().toISOString(),
                    lastError: "PoE authentication failed",
                    mode: "AUTH_FAILED",
                    nextWaitSeconds: 0,
                };
                console.error("Auth failed. Stop app and refresh your POE_COOKIE.");
                process.exit(1);
            } else {
                console.error("Watcher failed:", error);
                nextWaitSeconds = IDLE_WAIT_SECONDS;
                watcherStatus = {
                    ...watcherStatus,
                    lastCheckAt: new Date().toISOString(),
                    lastError: message,
                    mode: "ERROR",
                    nextWaitSeconds,
                };
            }
        }

        await sleep(nextWaitSeconds);
    }
}

export function getWatcherStatus() {
    return watcherStatus;
}
