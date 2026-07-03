import "dotenv/config";
import { PoeSale, getItemFrameType, getItemName } from "../poe/api";
import { formatConvertedValue, formatDiscordTimestamp } from "../services/valueformatter";
import { getDisplayLeagueName } from "../services/league";
import { addThumbnail, brandEmbed } from "./theme";
import { getRarityBadge, getRarityColor, getRarityFromFrameType } from "../services/rarity";
import { formatAnsiRarityText } from "../services/rarity";
import { formatItemCard } from "../services/itemcard";

type NotifyDiscordOptions = {
    testMode?: boolean;
};

export async function notifyDiscord(sale: PoeSale, options: NotifyDiscordOptions = {}) {
    const webhook = process.env.DISCORD_WEBHOOK_URL!;
    const league = getDisplayLeagueName();
    const itemName = getItemName(sale);
    const saleRarity = {
        item_frame_type: getItemFrameType(sale),
        item_rarity: sale.item.rarity ?? getRarityFromFrameType(getItemFrameType(sale)),
    };
    const itemCard = formatItemCard(sale.item);

    await fetch(webhook, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            embeds: [
                addThumbnail(
                    brandEmbed({
                        title: options.testMode ? "[TEST SALE] You've Sold This" : "[SALE] You've Sold This",
                        description: `\`\`\`ansi\n${formatAnsiRarityText(saleRarity, `${getRarityBadge(saleRarity)} ${itemName}`)}\n\`\`\`\n${formatConvertedValue({
                            price_amount: sale.price.amount,
                            price_currency: sale.price.currency,
                        })}${itemCard ? `\n\n${itemCard}` : ""}`,
                        fields: [
                            { name: "League", value: league, inline: true },
                            { name: "Time", value: formatDiscordTimestamp(sale.time, "f"), inline: true },
                            ...(options.testMode
                                ? [{ name: "Mode", value: "Developer test. Not saved to database.", inline: false }]
                                : []),
                        ],
                    }, getRarityColor(saleRarity)),
                    sale.item.icon
                ),
            ],
        }),
    });
}
