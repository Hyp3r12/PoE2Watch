const LOWERCASE_WORDS = new Set(["of", "the", "and"]);

export function formatLeagueName(league: string) {
    return league
        .trim()
        .toLowerCase()
        .split(/\s+/)
        .map((word, index) => {
            if (index > 0 && LOWERCASE_WORDS.has(word)) return word;

            return word.charAt(0).toUpperCase() + word.slice(1);
        })
        .join(" ");
}

export function getDisplayLeagueName() {
    return formatLeagueName(process.env.POE_LEAGUE ?? "Unknown");
}
