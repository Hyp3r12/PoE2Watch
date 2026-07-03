import { fetchSales, getItemName, PoeSale } from "./poe/api";
import { notifyDiscord } from "./discord/webhook";
import { hasSale, saveSale, getLastSales } from "./storage/salesvault";

const FAST_WAIT_SECONDS = 7 * 60; // 7 minutes
const IDLE_WAIT_SECONDS = 20 * 60; // 20 minutes
const RECENT_SALE_WINDOW_MS = 60 * 60 * 1000; // 1 hour

let nextWaitSeconds = IDLE_WAIT_SECONDS;

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
        if (!hasSale(sale)) {
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

export async function startWatcher() {
    console.log("✓ Adaptive watcher enabled");
    console.log("✓ FAST mode: 7 minutes after recent sales");
    console.log("✓ IDLE mode: 20 minutes after 1 hour without sales");

    while (true) {
        try {
            await checkForNewSales();

            const polling = getPollingMode();
            nextWaitSeconds = polling.waitSeconds;

            console.log(
                `[${new Date().toLocaleTimeString()}] Mode: ${polling.mode}. Next check in ${Math.round(
                    nextWaitSeconds / 60
                )} minutes.`
            );
        } catch (error) {
            const message = error instanceof Error ? error.message : String(error);

            if (message.startsWith("RATE_LIMIT:")) {
                const retryAfter = Number(message.split(":")[1]);
                nextWaitSeconds = Number.isFinite(retryAfter) ? retryAfter : 3600;
                console.log(`⚠️ Rate limited. Waiting ${Math.round(nextWaitSeconds / 60)} minutes.`);
            } else if (message.startsWith("AUTH_FAILED:")) {
                console.error("❌ Auth failed. Stop app and refresh your POE_COOKIE.");
                process.exit(1);
            } else {
                console.error("Watcher failed:", error);
                nextWaitSeconds = IDLE_WAIT_SECONDS;
            }
        }

        await sleep(nextWaitSeconds);
    }
}
