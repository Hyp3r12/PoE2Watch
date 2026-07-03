import { POE2WATCH_SALE_COLOR } from "../discord/theme";

export type ItemRarity = "normal" | "magic" | "rare" | "unique" | "gem" | "currency" | "quest" | "unknown";

type SaleRarityLike = {
    item_frame_type?: number | null;
    item_rarity?: string | null;
};

const RARITY_LABELS: Record<ItemRarity, string> = {
    normal: "Normal",
    magic: "Magic",
    rare: "Rare",
    unique: "Unique",
    gem: "Gem",
    currency: "Currency",
    quest: "Quest",
    unknown: "Unknown",
};

const RARITY_COLORS: Record<ItemRarity, number> = {
    normal: 0xc8c8c8,
    magic: 0x8888ff,
    rare: 0xffff77,
    unique: 0xaf6025,
    gem: 0x1ba29b,
    currency: POE2WATCH_SALE_COLOR,
    quest: 0x9b6bd3,
    unknown: POE2WATCH_SALE_COLOR,
};

const ANSI_COLORS: Record<ItemRarity, number> = {
    normal: 37,
    magic: 34,
    rare: 33,
    unique: 31,
    gem: 36,
    currency: 33,
    quest: 35,
    unknown: 37,
};

export function getRarityFromFrameType(frameType?: number | null): ItemRarity {
    if (frameType === 0) return "normal";
    if (frameType === 1) return "magic";
    if (frameType === 2) return "rare";
    if (frameType === 3) return "unique";
    if (frameType === 4) return "gem";
    if (frameType === 5) return "currency";
    if (frameType === 7) return "quest";

    return "unknown";
}

export function getFrameTypeFromRarity(rarity: ItemRarity) {
    if (rarity === "normal") return 0;
    if (rarity === "magic") return 1;
    if (rarity === "rare") return 2;
    if (rarity === "unique") return 3;
    if (rarity === "gem") return 4;
    if (rarity === "currency") return 5;
    if (rarity === "quest") return 7;

    return undefined;
}

export function normalizeRarity(rarity?: string | null): ItemRarity {
    const normalized = rarity?.toLowerCase();

    if (
        normalized === "normal" ||
        normalized === "magic" ||
        normalized === "rare" ||
        normalized === "unique" ||
        normalized === "gem" ||
        normalized === "currency" ||
        normalized === "quest"
    ) {
        return normalized;
    }

    return "unknown";
}

export function getSaleRarity(sale: SaleRarityLike): ItemRarity {
    const fromFrameType = getRarityFromFrameType(sale.item_frame_type);

    if (fromFrameType !== "unknown") {
        return fromFrameType;
    }

    return normalizeRarity(sale.item_rarity);
}

export function getRarityLabel(rarity: ItemRarity) {
    return RARITY_LABELS[rarity];
}

export function getRarityBadge(sale: SaleRarityLike) {
    return `[${getRarityLabel(getSaleRarity(sale)).toUpperCase()}]`;
}

export function getRarityColor(sale: SaleRarityLike) {
    return RARITY_COLORS[getSaleRarity(sale)];
}

export function formatAnsiRarityText(sale: SaleRarityLike, text: string) {
    const color = ANSI_COLORS[getSaleRarity(sale)];

    return `\u001b[1;${color}m${text}\u001b[0m`;
}
