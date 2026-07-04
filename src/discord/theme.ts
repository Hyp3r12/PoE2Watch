export const POE2WATCH_COLOR = 0xc8953f;
export const POE2WATCH_DANGER_COLOR = 0xb64032;
export const POE2WATCH_INFO_COLOR = 0x3f8fc8;
export const POE2WATCH_SALE_COLOR = 0xd6a84f;
export const POE2WATCH_TODAY_COLOR = 0x3fa86b;
export const POE2WATCH_WEEK_COLOR = 0x4f86d6;
export const POE2WATCH_MONTH_COLOR = 0x8b6bd6;
export const POE2WATCH_LEAGUE_COLOR = 0xb65a3c;
export const POE2WATCH_STATS_COLOR = 0xc8953f;
export const POE2WATCH_TOP_COLOR = 0xd66f3f;
export const POE2WATCH_INSIGHTS_COLOR = 0x6bc8b4;
export const POE2WATCH_GOAL_COLOR = 0x77b65a;
export const POE2WATCH_FOOTER = "PoE2Watch";

type EmbedLike = Record<string, any>;

export function brandEmbed<T extends EmbedLike>(embed: T, color = POE2WATCH_COLOR): T {
    return {
        color,
        ...embed,
        footer: {
            text: POE2WATCH_FOOTER,
            ...(embed.footer ?? {}),
        },
    };
}

export function addThumbnail<T extends EmbedLike>(embed: T, url?: string | null): T {
    if (!url) return embed;

    return {
        ...embed,
        thumbnail: {
            url,
        },
    };
}
