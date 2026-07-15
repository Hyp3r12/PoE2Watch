import "dotenv/config";
import { AuthFailedError, parseRetryAfterSeconds, RateLimitError } from "../services/httpErrors";

export type PoeSale = {
    time: string;
    item_id: string;
    item: {
        realm?: string;
        verified?: boolean;
        w?: number;
        h?: number;
        name?: string;
        typeLine: string;
        baseType?: string;
        icon?: string;
        league?: string;
        id?: string;
        ilvl?: number;
        identified?: boolean;
        corrupted?: boolean;
        fractured?: boolean;
        desecrated?: boolean;
        properties?: Array<{
            name: string;
            values?: Array<[string, number]>;
            displayMode?: number;
            type?: number;
        }>;
        requirements?: Array<{
            name: string;
            values?: Array<[string, number]>;
            displayMode?: number;
            type?: number;
        }>;
        implicitMods?: string[];
        explicitMods?: string[];
        craftedMods?: string[];
        fracturedMods?: string[];
        desecratedMods?: string[];
        enchantMods?: string[];
        utilityMods?: string[];
        scourgeMods?: string[];
        crucibleMods?: string[];
        flavourText?: string[];
        descrText?: string;
        frameType?: number;
        frameTypeId?: number;
        frame_type?: number;
        frame_type_id?: number;
        rarity?: string;
    };
    price: {
        amount: number;
        currency: string;
    };
};

export async function fetchSales(): Promise<PoeSale[]> {
    const league = process.env.POE_LEAGUE!;
    const cookie = process.env.POE_COOKIE!;

    const response = await fetch(
        `https://www.pathofexile.com/api/trade2/history/${encodeURIComponent(league)}`,
        {
            headers: {
                Cookie: cookie,
                Accept: "application/json",
                Referer: "https://www.pathofexile.com/trade2/history",
                Origin: "https://www.pathofexile.com",
                "User-Agent":
                    "PoE2Watch/0.1 personal sale notifier; contact: local",
            },
        }
    );

    if (response.status === 429) {
        throw new RateLimitError(parseRetryAfterSeconds(response.headers.get("retry-after"), 1800));
    }

    if (response.status === 401 || response.status === 403) {
        throw new AuthFailedError(response.status);
    }

    if (!response.ok) {
        throw new Error(`POE_ERROR:${response.status}`);
    }

    const data = await response.json();
    return data.result ?? [];
}

export function getSaleId(sale: PoeSale) {
    return `${sale.time}:${sale.item_id}:${sale.price.amount}:${sale.price.currency}`;
}

export function getItemName(sale: PoeSale) {
    return sale.item.name
        ? `${sale.item.name} ${sale.item.typeLine}`
        : sale.item.typeLine;
}

export function getItemFrameType(sale: PoeSale) {
    return sale.item.frameType ?? sale.item.frameTypeId ?? sale.item.frame_type ?? sale.item.frame_type_id;
}
