import { PoeSale } from "../poe/api";
import { formatAnsiRarityText, getRarityFromFrameType, getRarityLabel, normalizeRarity } from "./rarity";

export type ItemCardData = PoeSale["item"];

type ItemCardSaleLike = {
    item_json?: string | null;
};

const MAX_CARD_LENGTH = 2600;
const LINE = "------------------------------";
const ANSI_GOLD = "\u001b[1;33m";
const ANSI_MUTED = "\u001b[0;37m";
const ANSI_RESET = "\u001b[0m";

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

function getItemRarityLike(item: ItemCardData) {
    return {
        item_frame_type: item.frameType,
        item_rarity: item.rarity ?? getRarityFromFrameType(item.frameType),
    };
}

function sectionTitle(title: string) {
    return `${ANSI_GOLD}${title}${ANSI_RESET}`;
}

function muted(text: string) {
    return `${ANSI_MUTED}${text}${ANSI_RESET}`;
}

function addSection(lines: string[], title: string, values: string[]) {
    const cleaned = values.map(cleanTradeMarkup).filter(Boolean);

    if (cleaned.length === 0) return;

    lines.push(muted(LINE), sectionTitle(title));

    for (const value of cleaned) {
        lines.push(value);
    }
}

function addKeyValueSection(lines: string[], title: string, values: string[]) {
    const cleaned = values.filter(Boolean);

    if (cleaned.length === 0) return;

    lines.push(muted(LINE), sectionTitle(title), ...cleaned);
}

function formatProperties(item: ItemCardData) {
    const lines: string[] = [];

    if (item.baseType && item.baseType !== item.typeLine) {
        lines.push(`Base Type: ${cleanTradeMarkup(item.baseType)}`);
    }

    if (item.ilvl) {
        lines.push(`Item Level: ${item.ilvl}`);
    }

    if (item.w && item.h) {
        lines.push(`Inventory Size: ${item.w}x${item.h}`);
    }

    for (const property of item.properties ?? []) {
        const name = cleanTradeMarkup(property.name);
        const value = formatPropertyValue(property.values);

        if (!name || name.startsWith("[")) continue;

        lines.push(value ? `${name}: ${value}` : name);
    }

    return lines;
}

function formatRequirements(item: ItemCardData) {
    return (item.requirements ?? [])
        .map((requirement) => {
            const name = cleanTradeMarkup(requirement.name);
            const value = formatPropertyValue(requirement.values);

            if (!name) return "";

            return value ? `${name}: ${value}` : name;
        })
        .filter(Boolean);
}

function truncateCard(card: string) {
    if (card.length <= MAX_CARD_LENGTH) return card;

    return `${card.slice(0, MAX_CARD_LENGTH - 18).trimEnd()}\n...more item mods`;
}

export function getItemCardData(sale: ItemCardSaleLike) {
    return parseItemJson(sale);
}

export function formatItemCard(item?: ItemCardData | null) {
    if (!item) return null;

    const titleLines = item.name
        ? [
              formatAnsiRarityText(getItemRarityLike(item), cleanTradeMarkup(item.name)),
              formatAnsiRarityText(getItemRarityLike(item), cleanTradeMarkup(item.typeLine)),
          ]
        : [formatAnsiRarityText(getItemRarityLike(item), cleanTradeMarkup(item.typeLine))];
    const lines = [
        muted(LINE),
        ...titleLines,
        muted(getItemRarityLabel(item)),
        muted(LINE),
    ];
    const propertyLines = formatProperties(item);
    const requirementLines = formatRequirements(item);

    addKeyValueSection(lines, "Item Details", propertyLines);
    addKeyValueSection(lines, "Requirements", requirementLines);

    addSection(lines, "Enchanted Modifier", item.enchantMods ?? []);
    addSection(lines, "Implicit Modifiers", item.implicitMods ?? []);
    addSection(lines, "Fractured Modifiers", item.fracturedMods ?? []);
    addSection(lines, "Desecrated Modifiers", item.desecratedMods ?? []);
    addSection(lines, "Explicit Modifiers", item.explicitMods ?? []);
    addSection(lines, "Crafted Modifiers", item.craftedMods ?? []);
    addSection(lines, "Utility Modifiers", item.utilityMods ?? []);
    addSection(lines, "Scourge Modifiers", item.scourgeMods ?? []);
    addSection(lines, "Crucible Modifiers", item.crucibleMods ?? []);

    const flags = [
        item.corrupted ? "Corrupted" : null,
        item.fractured ? "Fractured" : null,
        item.desecrated ? "Desecrated" : null,
        item.identified === false ? "Unidentified" : null,
    ].filter(Boolean);

    if (flags.length > 0) {
        lines.push(muted(LINE), formatAnsiRarityText(getItemRarityLike(item), flags.join(" | ")));
    }

    if (item.descrText) {
        lines.push(muted(LINE), cleanTradeMarkup(item.descrText));
    }

    if (item.flavourText && item.flavourText.length > 0) {
        lines.push(muted(LINE), ...item.flavourText.map(cleanTradeMarkup));
    }

    return `\`\`\`ansi\n${truncateCard(lines.join("\n"))}\n\`\`\``;
}
