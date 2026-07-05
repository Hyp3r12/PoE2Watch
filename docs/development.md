# Development

## Scripts

```bash
npm run dev
npm run start
npm run register
npm run typecheck
```

## Developer Commands

```text
/dev fake-sale
/dev refresh-sale-metadata
```

Fake sale notifications are clearly labeled and are not written to the sales database.

Optional allowlist:

```env
DISCORD_DEV_USER_IDS=your_discord_user_id
```

## Architecture Direction

As PoE2Watch grows, the next cleanup target is central configuration.

Planned structure:

```text
src/config/config.ts
```

The goal is to stop reading `process.env` directly throughout services and instead import a typed `config` object with sections for Discord, polling, exchange rates, OAuth placeholders, website links, and database settings.

The statistics layer will also split naturally as analytics grows:

```text
src/services/statistics/summary.ts
src/services/statistics/leaderboards.ts
src/services/statistics/insights.ts
src/services/statistics/charts.ts
src/services/statistics/formatter.ts
```

## Website

The static website lives in:

```text
website/index.html
```

It is designed to deploy directly from the `website` folder on Cloudflare Pages.

## Release Notes

See [CHANGELOG.md](../CHANGELOG.md) for release notes, including `v0.5.0-alpha`.
