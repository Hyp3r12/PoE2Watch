# Community Discord Setup

This guide is for running a public PoE2Watch community server safely.

The short version: keep your live personal PoE2Watch bot private. Use the community server for support, updates, documentation, and optional demo channels.

## Recommended Server Layout

```text
START HERE
#welcome
#rules
#announcements
#poe2watch-updates
#faq

SUPPORT
#setup-help
#bug-reports
#feature-requests
#oauth-status

COMMUNITY
#general
#trade-talk
#build-talk
#showcase

DEMO
#poe2watch-demo
#bot-commands-demo

STAFF
#mod-chat
#mod-log
```

## Recommended Roles

```text
Owner
Admin
Moderator
Contributor
Trusted Tester
Community
Muted
PoE2Watch Bot
```

Keep permissions boring and strict:

| Role | Recommended Access |
| --- | --- |
| Owner | Full access. |
| Admin | Manage server, channels, roles, messages, and support. |
| Moderator | Manage messages, timeout members, view mod channels. |
| Contributor | Optional private contributor channels. |
| Trusted Tester | Optional testing/demo channels. |
| Community | Normal public channels only. |
| Muted | Read-only or no-send access. |
| PoE2Watch Bot | Only the permissions it needs in bot/demo channels. |

## Server Safety Settings

In Discord server settings:

- Enable **Community** if you want rules screening and announcement channels.
- Require verified email.
- Set verification/moderation level to at least medium.
- Disable dangerous `@everyone` permissions:
  - Manage Channels
  - Manage Roles
  - Manage Webhooks
  - Manage Server
  - Mention Everyone
  - Create Public Threads if spam becomes an issue
- Keep invite creation limited to staff if you want tighter control.
- Turn on AutoMod basics for spam, mention spam, and obvious scam links.

## Bot Safety Rule

Do not register your personal live PoE2Watch bot in a public server unless you are comfortable with people using commands that read your local data.

PoE2Watch currently uses local sale history for commands like:

- `/last3`
- `/top`
- `/stats`
- `/insights`
- `/history search`
- `/goal list`
- `/health view`

Those commands are meant for your private Discord server right now.

## Safer Community Options

### Option A: No Bot In Community

Use the community Discord for:

- setup help
- announcements
- issue triage
- feature requests
- screenshots
- documentation links

This is the safest default.

### Option B: Demo Webhook Only

Create a webhook in `#poe2watch-demo` and use it only for public demo posts.

Do not reuse your private webhook.

Anyone with a webhook URL can post into that channel, so treat it like a password.

### Option C: Separate Demo Bot Later

If you want a public demo bot later, make it separate from your live local bot:

- separate Discord application
- separate bot token
- separate `.env`
- fake/demo database only
- no real `POE_COOKIE`
- no private sales database

Until multi-user support and proper access controls exist, this is safer than sharing the live bot.

## If You Still Want To Register Commands In The Community Server

Only do this if you understand that commands may show your local PoE2Watch data.

Your community server ID can be used as:

```env
DISCORD_GUILD_ID=your_community_server_id
```

Then register commands:

```bash
npm run register
```

Docker:

```bash
docker compose run --rm poe2watch node node_modules/tsx/dist/cli.mjs src/registercommands.ts
```

For normal public-community use, this is not recommended yet.

## Channel Permission Checklist

### Public Info Channels

For `#welcome`, `#rules`, `#announcements`, and `#poe2watch-updates`:

- `Community`: read only
- `Moderator`: send/manage messages
- `Admin`: full channel control

### Support Channels

For `#setup-help`, `#bug-reports`, and `#feature-requests`:

- `Community`: read/send messages
- `Moderator`: manage messages
- `Admin`: manage channel

Pin a reminder:

```text
Never post your .env, POE_COOKIE, Discord bot token, webhook URL, database, or raw request headers.
Use /health export for support, and review it before posting.
```

### Demo Channels

For `#poe2watch-demo`:

- `Community`: read only, unless you want discussion there
- `PoE2Watch Bot`: send messages, embed links, attach files
- `Moderator`: manage messages

For `#bot-commands-demo`:

- Keep locked until there is a safe demo bot.

### Staff Channels

For `#mod-chat` and `#mod-log`:

- `Community`: no access
- `Trusted Tester`: no access unless needed
- `Moderator`: read/send
- `Admin`: full channel control

## What To Put In Rules

Suggested short rules:

```text
1. Be normal and respectful.
2. Do not post cookies, tokens, webhook URLs, .env files, databases, or raw request headers.
3. PoE2Watch is self-hosted alpha software. Expect rough edges.
4. Do not use PoE2Watch for gameplay automation, trade automation, or anything against GGG policy.
5. Support is best-effort and community driven.
```

## Current Recommendation

For now, use the community server as a public support and feedback hub.

Keep your real PoE2Watch bot in your private Discord server. If you want public examples, post screenshots or use a separate demo webhook.

## Optional Command-Based Setup

PoE2Watch includes a one-time helper script that can create the recommended roles, categories, and channels for a community server.

It does not register slash commands in the community server.

It does not add your PoE cookie.

It does not configure a public live trade bot.

It creates missing items only. Existing channels and roles are left alone.

### 1. Invite A Bot With Setup Permissions

The bot used for setup needs permission to manage roles and channels.

In Discord Developer Portal, generate an invite URL with:

Scopes:

```text
bot
applications.commands
```

Bot permissions:

```text
Manage Roles
Manage Channels
Send Messages
Embed Links
Attach Files
Read Message History
Moderate Members
Manage Messages
```

After setup, you can remove extra permissions or remove the bot from the community server if you only wanted it to build the server layout.

### 2. Dry Run First

PowerShell:

```powershell
$env:COMMUNITY_GUILD_ID="1524967106905374791"
npm run setup:community
```

This prints what would be created without changing Discord.

### 3. Apply When Ready

PowerShell:

```powershell
$env:COMMUNITY_GUILD_ID="1524967106905374791"
npm run setup:community -- --apply
```

### 4. Manual Follow-Up

Discord still needs a few manual security steps:

- Enable Community mode if wanted.
- Enable rules screening.
- Set server verification level.
- Turn on AutoMod basics.
- Assign staff roles to the right people.
- Review every channel permission.
- Do not register your live PoE2Watch slash commands in the public server yet.

## Optional Permission Lockdown

If new members can see too much before accepting rules, run the permission sync mode.

Dry run:

```powershell
$env:COMMUNITY_GUILD_ID="1524967106905374791"
npm run setup:community -- --sync-permissions
```

Apply:

```powershell
$env:COMMUNITY_GUILD_ID="1524967106905374791"
npm run setup:community -- --apply --sync-permissions
```

Command Prompt:

```bat
set COMMUNITY_GUILD_ID=1524967106905374791
npm run setup:community -- --sync-permissions
npm run setup:community -- --apply --sync-permissions
```

This locks the server like this:

| Area | New Members `@everyone` | `Community` Role |
| --- | --- | --- |
| START HERE | Can view, cannot talk | Can view, cannot talk |
| SUPPORT | Hidden | Can view and talk |
| COMMUNITY | Hidden | Can view and talk |
| DEMO | Hidden | Can view, mostly read-only |
| STAFF | Hidden | Hidden unless staff role |

Important: Discord's built-in rules screening does not automatically give your custom `Community` role.

After locking channels behind the `Community` role, you need one of these:

- Discord Onboarding/default role setup if available for your server.
- A trusted reaction-role bot such as Carl-bot or Dyno.
- Manual role assignment by staff.

Until that is set up, new users will only see `START HERE`.
