import "./storage/database";
import { fetchSales, getItemName, PoeSale } from "./poe/api";
import { notifyDiscord } from "./discord/webhook";
import { hasSale, saveSale, getLastSales } from "./storage/salesVault";

const NORMAL_WAIT_SECONDS = 300;
let nextWaitSeconds = NORMAL_WAIT_SECONDS;

async function sleep(seconds: number) {
    await new Promise((resolve) => setTimeout(resolve, seconds * 1000));
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
        console.log(
            `Sent: ${getItemName(sale)} - ${sale.price.amount} ${sale.price.currency}`
        );
    }
}

async function runForever() {
    console.log("=================================");
    console.log("        PoE2Watch v0.2");
    console.log("=================================");
    console.log(`Checking every ${NORMAL_WAIT_SECONDS} seconds.`);

    while (true) {
        try {
            await checkForNewSales();
            nextWaitSeconds = NORMAL_WAIT_SECONDS;
        } catch (error) {
            const message = error instanceof Error ? error.message : String(error);

            if (message.startsWith("RATE_LIMIT:")) {
                const retryAfter = Number(message.split(":")[1]);
                nextWaitSeconds = Number.isFinite(retryAfter) ? retryAfter : 1800;
                console.log(`⚠️ Rate limited. Waiting ${nextWaitSeconds} seconds.`);
            } else if (message.startsWith("AUTH_FAILED:")) {
                console.error("❌ Auth failed. Stop script and refresh your POE_COOKIE.");
                process.exit(1);
            } else {
                console.error("Check failed:", error);
            }
        }

        await sleep(nextWaitSeconds);
    }
}

runForever();