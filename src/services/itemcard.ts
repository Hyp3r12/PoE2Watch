import { PoeSale } from "../poe/api";
import { getRarityFromFrameType, getRarityLabel, normalizeRarity } from "./rarity";

export type ItemCardData = PoeSale["item"];

type ItemCardSaleLike = {
    item_json?: string | null;
};

type ModGroup = {
    label: string;
    mods: string[];
};

const MAX_CARD_LENGTH = 760;
const MAX_VISIBLE_MODS = 6;

function parseItemJson(sale: ItemCardSaleLike): ItemCardData | null {
    if (!sale.item_json) return null;

    try {
        return JSON.parse(sale.item_json) as ItemCardData;
    } catch {
        return null;
    }
}

function cleanTradeMarkup(text: string) {
    return text
        .replace(/\[([^\]|]+)\|([^\]]+)\]/g, "$2")
        .replace(/\s+/g, " ")
        .trim();
}

function formatPropertyValue(values?: Array<[string, number]>) {
    if (!values || values.length === 0) return "";

    return values
        .map(([value]) => cleanTradeMarkup(value))
        .filter(Boolean)
        .join(", ");
}

function getItemRarityLabel(item: ItemCardData) {
    const rarity = normalizeRarity(item.rarity);

    if (rarity !== "unknown") {
        return getRarityLabel(rarity);
    }

    return getRarityLabel(getRarityFromFrameType(item.frameType));
}

function formatDetailLine(item: ItemCardData) {
    const details = [getItemRarityLabel(item)];

    if (item.ilvl) {
        details.push(`ilvl ${item.ilvl}`);
    }

    if (item.w && item.h) {
        details.push(`${item.w}x${item.h}`);
    }

    for (const property of item.properties ?? []) {
        const name = cleanTradeMarkup(property.name);
        const value = formatPropertyValue(property.values);

        if (!name || name.startsWith("[")) continue;

        details.push(value ? `${name} ${value}` : name);
    }

    return details.join(" | ");
}

function formatRequirements(item: ItemCardData) {
    const requirements = (item.requirements ?? [])
        .map((requirement) => {
            const name = cleanTradeMarkup(requirement.name);
            const value = formatPropertyValue(requirement.values);

            if (!name) return "";

            return value ? `${name} ${value}` : name;
        })
        .filter(Boolean);

    return requirements.length > 0 ? `Req: ${requirements.join(", ")}` : null;
}

function getModGroups(item: ItemCardData): ModGroup[] {
    return [
        { label: "Enchant", mods: item.enchantMods ?? [] },
        { label: "Implicit", mods: item.implicitMods ?? [] },
        { label: "Fractured", mods: item.fracturedMods ?? [] },
        { label: "Desecrated", mods: item.desecratedMods ?? [] },
        { label: "Explicit", mods: item.explicitMods ?? [] },
        { label: "Crafted", mods: item.craftedMods ?? [] },
        { label: "Utility", mods: item.utilityMods ?? [] },
        { label: "Scourge", mods: item.scourgeMods ?? [] },
        { label: "Crucible", mods: item.crucibleMods ?? [] },
    ].filter((group) => group.mods.length > 0);
}

function formatMods(item: ItemCardData) {
    const groups = getModGroups(item);
    const lines: string[] = [];
    let shown = 0;
    let total = 0;

    for (const group of groups) {
        for (const mod of group.mods) {
            total += 1;

            if (shown >= MAX_VISIBLE_MODS) continue;

            const cleaned = cleanTradeMarkup(mod);
            if (!cleaned) continue;

            lines.push(`- ${group.label}: ${cleaned}`);
            shown += 1;
        }
    }

    if (total > shown) {
        lines.push(`- +${total - shown} more mod(s)`);
    }

    return lines;
}

function formatFlags(item: ItemCardData) {
    return [
        item.corrupted ? "Corrupted" : null,
        item.fractured ? "Fractured" : null,
        item.desecrated ? "Desecrated" : null,
        item.identified === false ? "Unidentified" : null,
    ].filter(Boolean);
}

function truncateCard(card: string) {
    if (card.length <= MAX_CARD_LENGTH) return card;

    return `${card.slice(0, MAX_CARD_LENGTH - 16).trimEnd()}\n...more`;
}

export function getItemCardData(sale: ItemCardSaleLike) {
    return parseItemJson(sale);
}

export function formatItemCard(item?: ItemCardData | null) {
    if (!item) return null;

    const lines = [formatDetailLine(item)];
    const requirements = formatRequirements(item);
    const flags = formatFlags(item);
    const mods = formatMods(item);

    if (requirements) {
        lines.push(requirements);
    }

    if (flags.length > 0) {
        lines.push(flags.join(" | "));
    }

    if (mods.length > 0) {
        lines.push("", "**Mods**", ...mods);
    }

    return truncateCard(lines.filter(Boolean).join("\n"));
}
