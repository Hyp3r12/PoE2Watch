import "dotenv/config";
import { PoeSale, getItemName } from "../poe/api";

export async function notifyDiscord(sale: PoeSale) {
    const webhook = process.env.DISCORD_WEBHOOK_URL!;
    const league = process.env.POE_LEAGUE!;
    const itemName = getItemName(sale);

    await fetch(webhook, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            embeds: [
                {
                    title: "💰 New PoE2 Sale",
                    description: `**${itemName}**\nSold for **${sale.price.amount} ${sale.price.currency}**`,
                    thumbnail: sale.item.icon ? { url: sale.item.icon } : undefined,
                    fields: [
                        { name: "League", value: league, inline: true },
                        { name: "Time", value: sale.time, inline: true },
                    ],
                },
            ],
        }),
    });
}