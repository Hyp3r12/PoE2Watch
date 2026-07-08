<p align="center">
  <img src="assets/project-logo.png" alt="PoE2Watch logo" width="180" />
</p>

<h1 align="center">PoE2Watch</h1>

<p align="center">
  <strong>Never wonder if your trade sold again.</strong>
</p>

<p align="center">
  A small Discord bot for Path of Exile 2 trade pings and sale stats.
</p>

<p align="center">
  <img alt="Version" src="https://img.shields.io/badge/version-v0.5.0--alpha-d4af37?style=for-the-badge&labelColor=050505" />
  <img alt="Status" src="https://img.shields.io/badge/status-active%20development-8b1e1e?style=for-the-badge&labelColor=050505" />
  <img alt="Self Hosted" src="https://img.shields.io/badge/self--hosted-runs%20on%20your%20PC-d4af37?style=for-the-badge&labelColor=050505" />
  <img alt="Read Only" src="https://img.shields.io/badge/read--only-no%20gameplay%20automation-f5d27a?style=for-the-badge&labelColor=050505" />
  <img alt="Docker" src="https://img.shields.io/badge/docker-hardened%20runtime-2496ed?style=for-the-badge&labelColor=050505" />
</p>

<p align="center">
  <a href="https://poe2watch.app/">Website</a>
  |
  <a href="docs/installation.md">Setup</a>
  |
  <a href="docs/commands.md">Commands</a>
  |
  <a href="docs/security.md">Security</a>
  |
  <a href="docs/docker.md">Docker</a>
  |
  <a href="CHANGELOG.md">Changelog</a>
</p>

---

## What Is PoE2Watch?

PoE2Watch is a Discord bot I started building because I kept wondering if anything sold while I was away.

While it is running on your machine, it checks your completed Path of Exile 2 sales, posts Discord notifications when it finds new ones, and keeps a local SQLite history for stats, top sales, goals, and search.

Sometimes one trade is all it takes to get a build moving again. A good sale can mean the next upgrade, the next craft, or just a reason to log back in with a plan instead of staring at your stash.

Until official GGG OAuth support is confirmed, PoE2Watch stays self-hosted. Your session stays on your machine, and the app only checks your own completed sale history.

**Tags:** `#PoE2` `#PathOfExile2` `#DiscordBot` `#TradeTracking` `#SelfHosted`

---

## Example Output

### Sale Notification

The example below was generated with `/dev fake-sale` so it does not save anything to the local sales database.

<p>
  <img src="assets/discord-sale-notification.png" alt="PoE2Watch Discord sale notification example" width="390" />
</p>

### Trading Insights

<p>
  <img src="assets/discord-insights.png" alt="PoE2Watch trading insights Discord command example" width="470" />
</p>

### Trading Goals

<p>
  <img src="assets/discord-goals.png" alt="PoE2Watch trading goals Discord command example" width="390" />
</p>

### Top Sales

<p>
  <img src="assets/discord-top-sale.png" alt="PoE2Watch top sale Discord command example" width="470" />
</p>

---

## Highlights

| Feature | Status | What It Does |
| --- | --- | --- |
| Near-real-time sale notifications | Complete | Checks for sales every 7 minutes after recent activity and every 20 minutes when idle. |
| SQLite trade history | Complete | Stores sale history on your machine for summaries and command output. |
| Adaptive polling | Complete | Checks faster after recent sales, slows down when idle, and respects rate-limit backoff. |
| Discord slash commands | Complete | Check recent sales, stats, insights, settings, goals, top sales, and history. |
| Hover-style item cards | Complete | Preserves item payloads and shows rarity, item details, and modifiers. |
| Trading goals | Complete | Track progress toward upgrades with prioritized goal spillover. |
| Inventory tracking | In progress | Sale history foundations are in place; broader inventory tracking is nearly complete. |
| Docker support | Alpha | Run PoE2Watch in a hardened container instead of installing Node/npm directly. |
| poe.ninja estimates | Alpha | Uses third-party market data cached for 12 hours for rough value estimates. |
| Official GGG OAuth | Placeholder | Waiting on confirmed app registration and guidance from GGG. |

---

## Quick Start

### Option A: Docker

Recommended if you want PoE2Watch isolated from your normal desktop Node/npm setup.

```bash
copy .env.example .env
docker compose build
docker compose run --rm poe2watch node node_modules/tsx/dist/cli.mjs src/registercommands.ts
docker compose up -d
```

View logs:

```bash
docker compose logs -f
```

Stop PoE2Watch:

```bash
docker compose down
```

### Option B: Local Node/npm

```bash
npm install
copy .env.example .env
npm run register
npm run dev
```

After setup, run this in Discord:

```text
/health
```

Full setup docs:

- [Docker](docs/docker.md)
- [Installation](docs/installation.md)
- [Discord Bot Setup](docs/discord-setup.md)
- [Configuration](docs/configuration.md)

---

## Commands

| Category | Commands |
| --- | --- |
| Trading | `/last3`, `/history search`, `/today`, `/week`, `/month`, `/league`, `/top` |
| Goals | `/goal add`, `/goal list`, `/goal view`, `/goal complete`, `/goal remove`, `/goal reorder`, `/goal clear-all` |
| Analytics | `/stats`, `/insights` |
| Settings | `/settings view`, `/settings display`, `/settings refresh-rates` |
| Diagnostics | `/health` |
| Developer | `/dev fake-sale`, `/dev refresh-sale-metadata` |

Read the full command guide:

[docs/commands.md](docs/commands.md)

---

## Documentation

| Page | Purpose |
| --- | --- |
| [Overview](docs/overview.md) | Why this exists, what it does, and what it does not do. |
| [Docker](docs/docker.md) | Run PoE2Watch in a hardened container instead of installing Node/npm directly. |
| [Installation](docs/installation.md) | Local setup and first run. |
| [Discord Setup](docs/discord-setup.md) | Creating your own Discord app and webhook channels. |
| [Commands](docs/commands.md) | Every slash command and what it is for. |
| [Configuration](docs/configuration.md) | Environment variables and display settings. |
| [Security](docs/security.md) | Secret handling, Cloudflare checklist, and reporting issues. |
| [Roadmap](docs/roadmap.md) | Current alpha line and planned future work. |
| [Development](docs/development.md) | Local scripts, dev commands, and architecture direction. |

---

## Project Principles

PoE2Watch is meant to stay:

- Read-only
- Self-hosted first
- Useful before fancy
- Open source
- Respectful of Grinding Gear Games' policies
- Clear about what it is doing

PoE2Watch never automates gameplay, never controls the game client, and never performs trades.

---

## Disclaimer

PoE2Watch is an independent community project and is not affiliated with, endorsed by, or sponsored by Grinding Gear Games.
