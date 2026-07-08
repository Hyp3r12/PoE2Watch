# Installation

PoE2Watch currently runs on your own machine with your own Discord app and your own local config.

There are two supported setup paths:

- **Docker:** recommended if you want PoE2Watch isolated from your normal desktop Node/npm setup.
- **Local Node/npm:** useful if you want to develop or edit the app directly.

## Requirements

### Docker

- Docker Desktop on Windows/macOS, or Docker Engine on Linux.
- A Discord server where you can add a bot.
- A Discord webhook for sale notifications.
- A Path of Exile account session cookie.

### Local Node/npm

- Node.js 18 or newer.
- npm.
- A Discord server where you can add a bot.
- A Discord webhook for sale notifications.
- A Path of Exile account session cookie.

## Docker Setup

Use the full [Docker guide](docker.md) if you want the container path.

Short version:

```bash
copy .env.example .env
docker compose build
docker compose run --rm poe2watch node node_modules/tsx/dist/cli.mjs src/registercommands.ts
docker compose up -d
```

Stop it later with:

```bash
docker compose down
```

## Local Node/npm Setup

### Install Dependencies

```bash
npm install
```

### Create Your Environment File

```bash
copy .env.example .env
```

Fill in the required values:

```env
DISCORD_WEBHOOK_URL=
DISCORD_WEBHOOK_URLS=
DISCORD_BOT_TOKEN=
DISCORD_CLIENT_ID=
DISCORD_GUILD_ID=

POE_COOKIE=
POE_LEAGUE=Runes of Aldur
```

Do not commit or share `.env`.

### Register Slash Commands

```bash
npm run register
```

### Start PoE2Watch

```bash
npm run dev
```

## Check Setup

In Discord, run:

```text
/health
```

`/health` checks local setup without exposing secret values.

## Next Steps

- [Discord Bot Setup](discord-setup.md)
- [Configuration](configuration.md)
- [Commands](commands.md)
