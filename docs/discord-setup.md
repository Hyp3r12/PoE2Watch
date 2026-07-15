# Discord Bot Setup

PoE2Watch currently uses your own Discord app. There is no public invite-able bot yet because official GGG OAuth support is still pending.

You are setting up two Discord pieces:

| Piece | What It Does | Stored In `.env` |
| --- | --- | --- |
| Bot application | Lets you run slash commands like `/stats`, `/last3`, and `/health view`. | `DISCORD_BOT_TOKEN`, `DISCORD_CLIENT_ID`, `DISCORD_GUILD_ID` |
| Webhook | Posts sale notifications into a channel. | `DISCORD_WEBHOOK_URL` |

The bot and webhook are both needed.

## Part 1: Create The Discord Application

1. Open the Discord Developer Portal:

```text
https://discord.com/developers/applications
```

2. Click **New Application**.
3. Name it `PoE2Watch`.
4. Open **Bot** in the left sidebar.
5. Click **Add Bot**.
6. Copy the bot token into `.env`:

```env
DISCORD_BOT_TOKEN=paste_bot_token_here
```

Treat this token like a password.

## Part 2: Copy The Application ID

1. In the Discord Developer Portal, open your PoE2Watch application.
2. Go to **General Information**.
3. Copy **Application ID**.
4. Put it in `.env`:

```env
DISCORD_CLIENT_ID=paste_application_id_here
```

## Part 3: Invite The Bot To Your Server

1. In the Discord Developer Portal, open **OAuth2 > URL Generator**.
2. Under **Scopes**, select:

```text
bot
applications.commands
```

3. Under **Bot Permissions**, select:

```text
Send Messages
Use Slash Commands
Embed Links
Attach Files
Read Message History
```

4. Copy the generated URL.
5. Open the URL in your browser.
6. Choose your Discord server and invite the bot.

## Part 4: Copy Your Server ID

Discord calls servers "guilds" in the API.

1. In Discord, open **User Settings > Advanced**.
2. Turn on **Developer Mode**.
3. Right-click your server icon.
4. Click **Copy Server ID**.
5. Put it in `.env`:

```env
DISCORD_GUILD_ID=paste_server_id_here
```

## Part 5: Create A Sale Notification Webhook

1. In Discord, open the channel where you want sale notifications.
2. Click **Edit Channel**.
3. Open **Integrations**.
4. Open **Webhooks**.
5. Click **New Webhook**.
6. Name it `PoE2Watch`.
7. Copy the webhook URL.
8. Put it in `.env`:

```env
DISCORD_WEBHOOK_URL=paste_webhook_url_here
```

Anyone with your webhook URL can post messages into that channel. Treat webhook URLs like passwords.

## Part 6: Optional Mirror Channels

If you want sale notifications copied to another Discord channel, create another webhook and add it to:

```env
DISCORD_WEBHOOK_URLS=paste_extra_webhook_here
```

For more than one extra channel, separate URLs with commas:

```env
DISCORD_WEBHOOK_URLS=url_one,url_two,url_three
```

Only sale notifications are mirrored. Slash commands still only work where your bot is installed.

## Part 7: Register Slash Commands

After `.env` has `DISCORD_BOT_TOKEN`, `DISCORD_CLIENT_ID`, and `DISCORD_GUILD_ID`, register commands.

Local Node/npm:

```bash
npm run register
```

Docker:

```bash
docker compose run --rm poe2watch node node_modules/tsx/dist/cli.mjs src/registercommands.ts
```

If commands do not appear in Discord, run the register command again.

## Part 8: Start PoE2Watch

Local Node/npm:

```bash
npm run dev
```

Docker:

```bash
docker compose up -d
```

Then run this in Discord:

```text
/health view
```

If `/health view` reports OK for Discord config and SQLite, your Discord setup is working.
