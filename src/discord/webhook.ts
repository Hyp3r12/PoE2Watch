import "dotenv/config";
import { PoeSale, getItemName } from "../poe/api";
import { formatConvertedValue, formatDiscordTimestamp } from "../services/valueformatter";
import { getDisplayLeagueName } from "../services/league";
import { brandEmbed } from "./theme";

type NotifyDiscordOptions = {
    testMode?: boolean;
};

export async function notifyDiscord(sale: PoeSale, options: NotifyDiscordOptions = {}) {
    const webhook = process.env.DISCORD_WEBHOOK_URL!;
    const league = getDisplayLeagueName();
    const itemName = getItemName(sale);

    await fetch(webhook, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            embeds: [
                brandEmbed({
                    title: options.testMode ? "[TEST SALE] PoE2Watch Notification Test" : "[SALE] New PoE2 Sale",
                    description: `**${itemName}**\n${formatConvertedValue({
                        price_amount: sale.price.amount,
                        price_currency: sale.price.currency,
                    })}`,
                    thumbnail: process.env.POE2WATCH_LOGO_URL
                        ? { url: process.env.POE2WATCH_LOGO_URL }
                        : sale.item.icon
                          ? { url: sale.item.icon }
                          : undefined,
                    fields: [
                        { name: "League", value: league, inline: true },
                        { name: "Time", value: formatDiscordTimestamp(sale.time, "f"), inline: true },
                        ...(options.testMode
                            ? [{ name: "Mode", value: "Developer test. Not saved to database.", inline: false }]
                            : []),
                    ],
                }),
            ],
        }),
    });
}
