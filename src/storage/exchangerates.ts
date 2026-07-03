import db from "./database";

export type ExchangeRate = {
    league: string;
    from_currency: string;
    to_currency: string;
    rate: number;
    source_timestamp: number;
    fetched_at: string;
};

export function getExchangeRate(fromCurrency: string, toCurrency: string, league = process.env.POE_LEAGUE ?? "Unknown") {
    return db
        .prepare(
            `
      SELECT league, from_currency, to_currency, rate, source_timestamp, fetched_at
      FROM exchange_rates
      WHERE league = ?
        AND from_currency = ?
        AND to_currency = ?
      `
        )
        .get(league, fromCurrency.toLowerCase(), toCurrency.toLowerCase()) as ExchangeRate | undefined;
}

export function getLatestRateFetch(league = process.env.POE_LEAGUE ?? "Unknown") {
    return db
        .prepare(
            `
      SELECT MAX(fetched_at) as fetched_at
      FROM exchange_rates
      WHERE league = ?
      `
        )
        .get(league) as { fetched_at: string | null };
}

export function saveExchangeRate(
    fromCurrency: string,
    toCurrency: string,
    rate: number,
    sourceTimestamp: number,
    league = process.env.POE_LEAGUE ?? "Unknown"
) {
    db.prepare(
        `
      INSERT INTO exchange_rates (
        league,
        from_currency,
        to_currency,
        rate,
        source_timestamp,
        fetched_at
      ) VALUES (?, ?, ?, ?, ?, ?)
      ON CONFLICT(league, from_currency, to_currency) DO UPDATE SET
        rate = excluded.rate,
        source_timestamp = excluded.source_timestamp,
        fetched_at = excluded.fetched_at
      `
    ).run(
        league,
        fromCurrency.toLowerCase(),
        toCurrency.toLowerCase(),
        rate,
        sourceTimestamp,
        new Date().toISOString()
    );
}
