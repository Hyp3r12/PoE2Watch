import "dotenv/config";
import { PoeSale, getItemFrameType, getItemName } from "../poe/api";
import {
    convertValue,
    formatConvertedValue,
    formatDiscordTimestamp,
    formatEstimateAmount,
    formatPrice,
} from "../services/valueformatter";
import { getDisplayLeagueName } from "../services/league";
import { addThumbnail, brandEmbed } from "./theme";
import { getRarityColor, getRarityFromFrameType } from "../services/rarity";
import { formatItemCard } from "../services/itemcard";
import { getSettings } from "../storage/settings";

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

function formatNotificationSummary(sale: PoeSale, itemName: string) {
    return `Sold: ${itemName} for ${formatPrice(sale.price.amount, sale.price.currency)}`;
}

function getEstimatedDivineValue(sale: PoeSale) {
    if (sale.price.currency.trim().toLowerCase() === "divine") {
        return sale.price.amount;
    }

    return convertValue(sale.price.amount, sale.price.currency, "divine");
}

function shouldIncludeNotificationText(sale: PoeSale) {
    const threshold = getSettings().notify_min_divine;

    if (threshold === null) return true;

    const estimatedDivine = getEstimatedDivineValue(sale);

    if (estimatedDivine === null) {
        return true;
    }

    return estimatedDivine >= threshold;
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
    const includeNotificationText = options.testMode || shouldIncludeNotificationText(sale);
    const saleRarity = {
        item_frame_type: getItemFrameType(sale),
        item_rarity: sale.item.rarity ?? getRarityFromFrameType(getItemFrameType(sale)),
    };
    const itemCard = formatItemCard(sale.item);

    const payload = {
        username: "PoE2Watch",
        ...(logoUrl ? { avatar_url: logoUrl } : {}),
        ...(includeNotificationText ? { content: formatNotificationSummary(sale, itemName) } : {}),
        allowed_mentions: { parse: [] },
        embeds: [
            addThumbnail(
                brandEmbed({
                    title: "You've Sold This",
                    description: `**${itemName}**\n${formatConvertedValue({
                        price_amount: sale.price.amount,
                        price_currency: sale.price.currency,
                    })}${itemCard ? `\n\n${itemCard}` : ""}`,
                    fields: [
                        { name: "League", value: league, inline: true },
                        { name: "Time", value: formatDiscordTimestamp(sale.time, "f"), inline: true },
                    ],
                    ...(options.testMode
                        ? { footer: { text: "PoE2Watch - Developer test. Not saved to database." } }
                        : !includeNotificationText
                          ? {
                                footer: {
                                    text: `PoE2Watch - Below ${formatEstimateAmount(
                                        getSettings().notify_min_divine ?? 0
                                    )} Divine notification threshold.`,
                                },
                            }
                        : {}),
                }, getRarityColor(saleRarity)),
                sale.item.icon
            ),
        ],
    };

    await Promise.all(webhooks.map((webhook) => postWebhook(webhook, payload)));
}
