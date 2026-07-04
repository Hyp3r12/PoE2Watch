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

function getWebhookUrls() {
    return [
        process.env.DISCORD_WEBHOOK_URL,
        ...(process.env.DISCORD_WEBHOOK_URLS ?? "")
            .split(",")
            .map((url) => url.trim())
            .filter(Boolean),
    ].filter(Boolean) as string[];
}

function formatNotificationSummary(sale: PoeSale, itemName: string, testMode?: boolean) {
    const prefix = testMode ? "Test sale" : "Sold";

    return `${prefix}: ${itemName} for ${formatPrice(sale.price.amount, sale.price.currency)}`;
}

async function postWebhook(url: string, payload: Record<string, unknown>) {
    const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
    });

    if (!response.ok) {
        throw new Error(`DISCORD_WEBHOOK_ERROR:${response.status}`);
    }
}

export async function notifyDiscord(sale: PoeSale, options: NotifyDiscordOptions = {}) {
    const webhooks = getWebhookUrls();

    if (webhooks.length === 0) {
        throw new Error("DISCORD_WEBHOOK_URL is missing from .env");
    }

    const logoUrl = process.env.POE2WATCH_LOGO_URL || DEFAULT_WEBHOOK_AVATAR_URL;
    const league = getDisplayLeagueName();
    const itemName = getItemName(sale);
    const saleRarity = {
        item_frame_type: getItemFrameType(sale),
        item_rarity: sale.item.rarity ?? getRarityFromFrameType(getItemFrameType(sale)),
    };
    const itemCard = formatItemCard(sale.item);

    const payload = {
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
    };

    await Promise.all(webhooks.map((webhook) => postWebhook(webhook, payload)));
}
