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
POE_COOKIE=POESESSID=example_fake_session_value_here
POE_LEAGUE=Runes of Aldur
```

`POE_COOKIE` is sensitive. Treat it like a password.

`POE_COOKIE` must include the cookie name and value. Do not paste only the alphanumeric session value.

Correct fake example:

```env
POE_COOKIE=POESESSID=example_fake_session_value_here
```

Common wrong example:

```env
POE_COOKIE=example_fake_session_value_here
```

If PoE2Watch starts correctly but prints `Auth failed. Stop app and refresh your POE_COOKIE.`, double-check this format first, then refresh your session by logging back into pathofexile.com and copying the current `POESESSID`.

## Polling Behavior

PoE2Watch currently uses adaptive polling:

- **Fast mode:** checks every 7 minutes after recent sale activity.
- **Idle mode:** checks every 20 minutes after 1 hour without sales.
- **Rate limited:** waits for PoE's `Retry-After` response when available, or falls back to a longer wait.

Notifications are near-real-time, not push/instant.

## Notification Threshold

Use `/settings notification-threshold amount:1` to only include the short mobile-style notification text for sales worth at least 1 estimated Divine.

![PoE2Watch notification threshold setting example](../assets/notification-threshold-setting.png)

Smaller sales still:

- save to the local database
- post their item card to Discord
- count toward stats, goals, history, and insights

Use `/settings notification-threshold amount:0` to turn the threshold off and include mobile notification text for every sale again.

## Currency Estimates

PoE2Watch can use cached poe.ninja market data for temporary third-party value estimates.

```env
POE_RATE_PROVIDER=poe-ninja
POE_NINJA_LEAGUE_NAME=Runes of Aldur
POE_NINJA_LEAGUE_SLUG=runesofaldur
```

Important notes:

- poe.ninja estimates are third-party market estimates, not official GGG data.
- poe.ninja estimates are cached for 12 hours by default.
- Official GGG currency exchange integration remains a placeholder until app registration is confirmed.
- Converted values are marked as estimates.

## Local Data

PoE2Watch stores local runtime data in:

```text
data/sales.db
seen-sales.json
```

These files are ignored by Git and should stay private.
