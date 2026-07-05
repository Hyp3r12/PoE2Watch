# Discord Setup

PoE2Watch is self-hosted. For now, you should create your own Discord application and run the bot on your own machine.

There is no public inviteable PoE2Watch bot yet because official GGG OAuth support is still pending.

## Create The Discord App

1. Go to the Discord Developer Portal:

```text
https://discord.com/developers/applications
```

2. Click **New Application**.
3. Name it `PoE2Watch`.
4. Open **Bot**.
5. Click **Add Bot**.
6. Copy the bot token into `.env`:

```env
DISCORD_BOT_TOKEN=
```

7. Open **OAuth2 > URL Generator**.
8. Select these scopes:

```text
bot
applications.commands
```

9. Select these bot permissions:

```text
Send Messages
Use Slash Commands
Embed Links
Attach Files
Read Message History
```

10. Open the generated URL and invite the bot to your server.
11. Copy your application ID into `.env`:

```env
DISCORD_CLIENT_ID=
```

12. Copy your server ID into `.env`:

```env
DISCORD_GUILD_ID=
```

13. Register slash commands:

```bash
npm run register
```

14. Start PoE2Watch:

```bash
npm run dev
```

15. In Discord, run:

```text
/health
```

## Sale Notification Webhooks

PoE2Watch sends sale notifications through Discord webhooks.

Use `DISCORD_WEBHOOK_URL` for your main/private notification channel:

```env
DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/your-private-channel
```

Anyone with your webhook URL can post messages into that Discord channel. Treat webhook URLs like passwords and do not share them publicly.

## Mirroring Sale Notifications

PoE2Watch can send sale notifications to more than one Discord channel.

Use `DISCORD_WEBHOOK_URLS` for extra mirror channels:

```env
DISCORD_WEBHOOK_URLS=https://discord.com/api/webhooks/your-friends-channel
```

For multiple mirror channels, separate them with commas:

```env
DISCORD_WEBHOOK_URLS=https://discord.com/api/webhooks/channel-one,https://discord.com/api/webhooks/channel-two
```

Only webhook sale notifications are mirrored. Slash commands still only run where your Discord bot is installed.
