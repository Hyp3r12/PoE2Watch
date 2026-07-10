# FAQ

This page collects the most common questions and concerns from early feedback.

## Why Would I Use This?

PoE2Watch is for players who want to know when an Ange trade sale happens while the app is running.

I built it because I kept logging off and wondering if anything sold while I was away. If a sale comes through while I am working, around the house, or away from the computer, a Discord ping lets me know I have currency waiting when I get back.

It is not meant to play the game for you. It is meant to remove the "did anything sell?" guessing loop and keep a local history for recent sales, top sales, goals, search, and stats.

## Is This Instant?

No. PoE2Watch is polling-based.

Current default behavior:

- checks every 7 minutes after recent sale activity
- checks every 20 minutes when idle
- backs off when rate limited or when the trade site is unhealthy

Discord notifications can feel quick, but they are not official push notifications.

## How Do I Get Help Without Sharing Secrets?

Use `/health export`.

It creates a sanitized diagnostics text file with setup status, database status, exchange cache status, watcher state, and broad error categories. It does not include cookies, tokens, webhook URLs, or session IDs.

Review the file before posting it publicly, then attach it to a GitHub issue if you need help.

PoE2Watch also prints a startup setup check in the terminal so missing config is visible before you start troubleshooting Discord.

## What Shows Up On My Phone?

Mobile notifications are kept short on purpose.

The lock-screen ping should show the important part first: PoE2Watch, the Discord channel, the sold item, and the sale price. When you open Discord, the full item card can show more detail like item image, rarity, requirements, and modifiers.

You can also set a notification threshold with `/settings notification-threshold`. Smaller sales still post to Discord and save locally, but they do not include the short mobile summary text.

## What Does It Track?

PoE2Watch checks completed sale history for Ange trade sales.

It does not scan your stash, automate listings, perform trades, or control the game client.

## Why Does It Run Locally?

PoE2Watch currently uses your own local config, your own Discord app/bot, and your own session.

Until official GGG OAuth support and app registration are confirmed, the project avoids hosted multi-user login, shared bot auth, or storing other users' Path of Exile credentials.

## Can I Invite Your Bot To My Server?

Not yet.

The current version is self-hosted. You create your own Discord app/bot and run PoE2Watch locally or in Docker.

A public invite-able bot depends on official OAuth guidance from GGG, because users need a safer way to connect their own Path of Exile account without sharing cookies.

## Can I Host This On A Cheap Cloud Server?

Technically, yes, but be careful.

PoE2Watch can run anywhere that can run Node or Docker, including a small VPS. The important part is that your `.env` file would live on that server, including your PoE session cookie and Discord secrets.

Only run it on infrastructure you trust.

## Do I Have To Keep My Main PC Running?

PoE2Watch only checks for sales while it is running.

You can run it on:

- your main PC
- a small home server
- a Raspberry Pi
- a VPS you personally trust
- a Docker or k3s setup

If you do not want your main computer running all day, a small home server or Raspberry Pi is a better fit than leaving a gaming PC on.

## Why Docker?

Docker gives PoE2Watch a cleaner place to run without installing Node/npm directly on your main machine.

The Docker runtime is intentionally small:

- no npm, npx, yarn, or corepack in runtime
- no build tools in runtime
- runs as a non-root user
- keeps `.env` and `data/` outside the image

Docker does not make secrets harmless. The container still needs access to `.env` so PoE2Watch can work.

## What About npm Supply Chain Risk?

That concern is fair.

PoE2Watch uses a small dependency set, keeps `npm audit` clean, and supports Docker for people who want a more isolated runtime. Dependabot, CodeQL, and GitHub Actions are also used on the repo.

That does not mean "trust this blindly." The project is open source so people can inspect it, run it in Docker, or wait until OAuth/cloud support exists.

## Could This Be A Phone App?

Maybe someday, but not in the current alpha.

A phone app or hosted service still needs the same core problem solved first: a safe account connection flow. That likely means official OAuth support rather than asking users to paste cookies into an app.

## Is This Addiction-Bait?

The goal is not to make anyone play more than they want to.

PoE2Watch was built around a familiar trading problem: sometimes you are waiting on one sale to unlock the next build step. The app is meant to keep you informed while it is running, not pressure you into playing.

## Does This Create Extra Load For GGG?

PoE2Watch uses adaptive polling and backs off on rate limits.

The local alpha is intended for personal use. A hosted multi-user version would need stricter scheduling, inactive-user checks, staggered polling, and official guidance from GGG before it should exist.

## Was AI Used?

AI was used lightly for artwork help, learning, and development assistance while building PoE2Watch.

The app was shaped around real PoE2 trading needs, tested locally, and kept open source so people can inspect what it does.

## What Is Waiting On GGG?

These should wait for official guidance:

- OAuth login
- hosted PoE2Watch Cloud
- public invite-able Discord bot
- multi-user account linking
- storing user auth on a server
- paid or faster polling tiers

Until then, PoE2Watch stays self-hosted and read-only.
