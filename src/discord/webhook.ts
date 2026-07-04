import "dotenv/config";
import { PoeSale, getItemFrameType, getItemName } from "../poe/api";
import { formatConvertedValue, formatDiscordTimestamp, formatPrice } from "../services/valueformatter";
import { getDisplayLeagueName } from "../services/league";
import { addThumbnail, brandEmbed } from "./theme";
import { getRarityColor, getRarityFromFrameType } from "../services/rarity";
import { formatItemCard } from "../services/itemcard";

type NotifyDiscordOptions = {
    testMode?: boolean;
};

const DEFAULT_WEBHOOK_AVATAR_URL = "https://poe2watch.app/assets/project-logo.png";

function formatNotificationSummary(sale: PoeSale, itemName: string, testMode?: boolean) {
    const prefix = testMode ? "Test sale" : "Sold";

    return `${prefix}: ${itemName} for ${formatPrice(sale.price.amount, sale.price.currency)}`;
}

export async function notifyDiscord(sale: PoeSale, options: NotifyDiscordOptions = {}) {
    const webhook = process.env.DISCORD_WEBHOOK_URL!;
    const logoUrl = process.env.POE2WATCH_LOGO_URL || DEFAULT_WEBHOOK_AVATAR_URL;
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
            username: "PoE2Watch",
            ...(logoUrl ? { avatar_url: logoUrl } : {}),
            content: formatNotificationSummary(sale, itemName, options.testMode),
            allowed_mentions: { parse: [] },
            embeds: [
                addThumbnail(
                    brandEmbed({
                        title: options.testMode ? "Test Sale" : "You've Sold This",
                        description: `**${itemName}**\n${formatConvertedValue({
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
