# Installation

PoE2Watch is self-hosted. That means you run it yourself with your own Discord app, your own webhook, and your own local `.env` file.

This guide assumes you already finished [Discord Bot Setup](discord-setup.md). If you have not done that yet, start there first.

## Pick A Setup Path

| Path | Best For | What It Means |
| --- | --- | --- |
| Docker | Most normal users | Runs PoE2Watch in a container so you do not install Node/npm directly on your desktop. |
| Local Node/npm | Development or code editing | Runs PoE2Watch directly from the project folder with Node.js and npm. |

Use **Docker** if you are unsure.

## Before You Start

You should have:

- A Discord bot token.
- A Discord client/application ID.
- Your Discord server/guild ID.
- A Discord webhook URL for sale notifications.
- Your Path of Exile 2 league name, like `Runes of Aldur`.
- Your Path of Exile session cookie.

Never paste your `.env`, bot token, webhook URL, PoE cookie, or `docker compose config` output into public chats or GitHub issues.

## Step 1: Create `.env`

From the project folder:

```bash
copy .env.example .env
```

Open `.env` in a text editor and fill in the required values:

```env
DISCORD_WEBHOOK_URL=
DISCORD_BOT_TOKEN=
DISCORD_CLIENT_ID=
DISCORD_GUILD_ID=

POE_COOKIE=
POE_LEAGUE=Runes of Aldur
```

Optional values can stay blank until you need them.

## Step 2A: Docker Setup

Build the container:

```bash
docker compose build
```

Register slash commands:

```bash
docker compose run --rm poe2watch node node_modules/tsx/dist/cli.mjs src/registercommands.ts
```

Start PoE2Watch:

```bash
docker compose up -d
```

Watch logs:

```bash
docker compose logs -f
```

Stop PoE2Watch:

```bash
docker compose down
```

Important: run only one copy of PoE2Watch per Discord bot token. Do not keep Docker running while also running `npm run dev`, or both copies may answer the same Discord command.

## Step 2B: Local Node/npm Setup

Install dependencies:

```bash
npm install
```

Register slash commands:

```bash
npm run register
```

Start PoE2Watch:

```bash
npm run dev
```

Leave this terminal open while you want PoE2Watch running.

## Step 3: Confirm It Works

In Discord, run:

```text
/health view
```

You want to see:

- Discord webhook: OK
- Discord bot token: OK
- Discord client ID: OK
- Discord guild ID: OK
- PoE cookie: OK
- SQLite: OK

If you need help, run:

```text
/health export
```

That creates a sanitized diagnostics file for support. Review it before posting, but it is designed to avoid cookies, tokens, webhook URLs, and session IDs.

## Step 4: Test A Notification

If you are a server administrator, you can send a fake sale notification:

```text
/dev fake-sale
```

This posts a real-style sale card to Discord but does not save a fake sale to your database.

## Step 5: Basic Settings

View settings:

```text
/settings view
```

Only show mobile notification text for sales worth at least 1 estimated Divine:

```text
/settings notification-threshold amount:1
```

Smaller sales still post to Discord and still count toward stats, history, and goals.

## Common First-Run Problems

| Problem | What To Check |
| --- | --- |
| Slash commands do not show up | Run the register command again and make sure `DISCORD_CLIENT_ID` and `DISCORD_GUILD_ID` are correct. |
| Bot is online but notifications do not post | Check `DISCORD_WEBHOOK_URL`. Webhooks post sale notifications; the bot token handles slash commands. |
| `/health view` says PoE cookie missing | Fill in `POE_COOKIE` in `.env`, then restart PoE2Watch. |
| Commands answer twice or fail with already acknowledged | Make sure Docker and `npm run dev` are not both running with the same bot token. |
| Rate limited | Wait for the backoff timer. PoE2Watch will slow down automatically. |

## Next Steps

- [Commands](commands.md)
- [Configuration](configuration.md)
- [Docker](docker.md)
- [Security](security.md)
