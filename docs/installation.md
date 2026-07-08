# Installation

PoE2Watch currently runs on your own machine with your own Discord app and your own local config.

## Requirements

- Node.js 18 or newer.
- npm.
- A Discord server where you can add a bot.
- A Discord webhook for sale notifications.
- A Path of Exile account session cookie.

If you do not want to install Node/npm directly, use the [Docker guide](docker.md).

## Install Dependencies

```bash
npm install
```

## Create Your Environment File

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

## Register Slash Commands

```bash
npm run register
```

## Start PoE2Watch

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
