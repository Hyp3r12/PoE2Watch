# Configuration

PoE2Watch reads local settings from `.env`.

Do not commit or share `.env`.

## Discord

```env
DISCORD_WEBHOOK_URL=
DISCORD_WEBHOOK_URLS=
DISCORD_BOT_TOKEN=
DISCORD_CLIENT_ID=
DISCORD_GUILD_ID=
DISCORD_DEV_USER_IDS=
```

`DISCORD_WEBHOOK_URL` is the main sale notification webhook.

`DISCORD_WEBHOOK_URLS` is an optional comma-separated list of extra mirror webhooks.

`DISCORD_DEV_USER_IDS` is an optional allowlist for developer-only commands such as `/dev fake-sale`.

## Path of Exile

```env
POE_COOKIE=
POE_LEAGUE=Runes of Aldur
```

`POE_COOKIE` is sensitive. Treat it like a password.

## Polling Behavior

PoE2Watch currently uses adaptive polling:

- **Fast mode:** checks every 7 minutes after recent sale activity.
- **Idle mode:** checks every 20 minutes after 1 hour without sales.
- **Rate limited:** waits for the retry window returned by the trade endpoint, or falls back to a longer wait.

Notifications are near-real-time, not push/instant.

## Currency Estimates

PoE2Watch can use cached poe.ninja market data for temporary third-party value estimates.

```env
POE_RATE_PROVIDER=poe-ninja
POE_NINJA_LEAGUE_NAME=Runes of Aldur
POE_NINJA_LEAGUE_SLUG=runesofaldur
```

Important notes:

- poe.ninja estimates are third-party market estimates, not official GGG data.
- Official GGG currency exchange integration remains a placeholder until app registration is confirmed.
- Converted values are marked as estimates.

## Local Data

PoE2Watch stores local runtime data in:

```text
data/sales.db
seen-sales.json
```

These files are ignored by Git and should stay private.
