# Changelog

All notable changes to PoE2Watch will be documented in this file.

PoE2Watch follows a lightweight alpha release style while the project is still moving quickly.

## [Unreleased]

### Release Summary

This update continues the v0.5 Trading Experience line with a focus on stability, safer self-hosting, better documentation, and cleaner notification control. The core app remains local-first, read-only, and pending official GGG OAuth guidance for any hosted or invite-able bot future.

### Added

- Added hardened Docker support with `Dockerfile`, `docker-compose.yml`, `.dockerignore`, and a dedicated Docker guide.
- Added Docker-first setup paths to the README and installation docs.
- Added Docker runtime hardening notes covering the non-root runtime user, no build tools in runtime, no npm/yarn/corepack in runtime, and keeping `.env`/`data/` outside the image.
- Added a GitHub Actions CI workflow that runs `npm ci` and `npm run typecheck`.
- Added explicit read-only GitHub Actions token permissions with `contents: read`.
- Added a full `CONTRIBUTING.md` guide with project direction, feature ethics, setup steps, security rules, PR checklist, and style notes.
- Added `LICENSE` and switched project metadata to MIT.
- Added `docs/faq.md` based on early community feedback around local hosting, Docker, supply-chain concerns, OAuth, mobile notifications, GGG load, and AI transparency.
- Added README and website previews for mobile Discord sale notifications.
- Added notification threshold support through `/settings notification-threshold`.
- Added documentation screenshots for the notification threshold setting.
- Added SQLite settings storage for `notify_min_divine`.
- Added 12-hour poe.ninja exchange-rate refresh behavior during watcher loops.
- Added local sale history search through `/history search`.

### Changed

- Renamed the npm package from `ange-watch` to `poe2watch`.
- Cleaned up the README header with smaller badges, calmer colors, shorter labels, and a simpler project trait line.
- Updated README navigation and documentation tables to include Docker and FAQ.
- Updated setup docs so Docker is presented as a first-class option instead of a side note.
- Updated `/settings view` to show the current notification threshold.
- Changed sale webhook behavior so every sale can still post to Discord while only above-threshold sales include the short mobile notification text.
- Kept `/dev fake-sale` showing the mobile summary text regardless of notification threshold so notification testing remains straightforward.
- Updated FAQ and configuration docs to explain the difference between Discord item-card posts and mobile notification summary text.

### Fixed

- Fixed the Linux/Docker command registration path by aligning the `registercommands.ts` filename casing.
- Fixed Docker image vulnerability scan noise by removing package-manager internals from the runtime image.
- Fixed CI workflow permission warning by limiting the default token to read-only repository contents.
- Fixed README badge wrapping and visual clutter on GitHub.

### Security and Safety

- Docker image scans reached 0 reported vulnerabilities after hardening.
- `npm audit` remains clean.
- Runtime Docker image does not copy `.env`, local sale data, `node_modules`, or `seen-sales.json`.
- The Docker runtime runs without npm, npx, yarn, corepack, or build tools.
- Notification thresholds do not hide or discard sales; smaller sales still post to Discord embeds and remain in local history/statistics.
- OAuth, cloud hosting, public invite-able bot support, and multi-user account linking remain blocked on official GGG guidance.

### Upgrade Notes

- Re-register Discord commands after updating because `/settings` gained `notification-threshold`:

```bash
npm run register
```

- Docker users can register commands with:

```bash
docker compose run --rm poe2watch node node_modules/tsx/dist/cli.mjs src/registercommands.ts
```

- Restart PoE2Watch after updating so SQLite can add the `notify_min_divine` settings column.
- Set a threshold with:

```text
/settings notification-threshold amount:1
```

- Disable the threshold with:

```text
/settings notification-threshold amount:0
```

## [v0.5.0-alpha] - 2026-07-03

### Release Summary

PoE2Watch v0.5.0-alpha begins the Trading Experience release line. This release focuses on making Discord output feel more like a real Path of Exile companion by preserving richer item data and showing hover-style item cards in sale notifications and item-focused command output.

The project remains read-only, self-hosted, and independent from Grinding Gear Games.

### Added

- Added storage for the full GGG sale item payload in SQLite through the new `item_json` column.
- Added hover-style Discord item cards that show rarity, item details, requirements, modifiers, item flags, description text, and flavour text when available.
- Added richer item payload typing for trade history responses, including properties, requirements, implicit mods, explicit mods, crafted mods, fractured mods, desecrated mods, utility mods, flavour text, item level, size, and item state flags.
- Added item-card display support to sale notifications, `/last3`, `/top`, and largest-sale summary sections.
- Added richer `/dev fake-sale` sample item details so notification formatting can be tested without waiting for a real sale.
- Added `/goal add`, `/goal list`, `/goal complete`, `/goal remove`, `/goal reorder`, and `/goal clear-all` for prioritized trading goals.
- Added `/health` for a private setup and runtime status report.

### Changed

- Changed sale notification language to focus on the sold item with the cleaner `You've Sold This` title.
- Changed sale notifications to prioritize sold-item artwork over project-logo thumbnails when item art is available.
- Updated `/dev refresh-sale-metadata` wording to reflect that it now refreshes item details as well as icons and rarity.
- Updated project version metadata to `0.5.0-alpha`.
- Updated README and roadmap copy for the active v0.5 Trading Experience line.
- Replaced the planned `/wealth` concept with prioritized goal progress tracking to avoid redundant stats commands.

### Safety and Compatibility

- The new database migration is additive only. Existing installs keep their current sales and receive `item_json` automatically after restart.
- Existing sales need `/dev refresh-sale-metadata` to backfill hover-style item details when the trade history API still returns those records.
- New sales store item details automatically.
- Item card rendering is Discord-safe text inside embeds. A true generated PNG card remains future work.

### Upgrade Notes

- Restart the bot after updating so SQLite can add the new `item_json` column.
- Re-register Discord commands after updating:

```bash
npm run register
```

- Backfill recent item metadata after rate limits clear:

```text
/dev refresh-sale-metadata
```

## [v0.4.0-alpha] - 2026-07-03

### Release Summary

PoE2Watch v0.4.0-alpha turns the project from a sale notification prototype into a real Discord companion. This release adds richer slash commands, personal trade analytics, configurable display settings, temporary poe.ninja-powered value estimates, developer test tooling, and a polished static landing page.

The project remains read-only, self-hosted, and independent from Grinding Gear Games.

### Added

- Added Discord slash command registry so commands are defined in one place and easier to extend.
- Added `/today`, `/week`, `/month`, `/league`, and `/stats` summary commands.
- Added `/top` for reviewing highest-value sales.
- Added `/insights` for trading analytics including best selling day, most sold item type, highest value category, largest sale, and estimated wealth traded.
- Added `/settings` for viewing and updating display preferences.
- Added `/dev fake-sale` for administrator-only notification testing without saving fake sales to the database.
- Added SQLite-backed settings storage.
- Added SQLite-backed exchange-rate cache.
- Added third-party poe.ninja market estimate support for temporary currency conversion.
- Added explicit placeholder gate for official GGG OAuth exchange support.
- Added prettier Discord embeds with command-specific colors, badges, item thumbnails, estimated values, and progress bars.
- Added league dashboard fields including league age, sales today, average per day, and highest day.
- Replaced `/last5` with `/last3` for cleaner recent-sale previews.
- Updated `/top` to show up to three clean item-style sale embeds.
- Added `tsconfig.json` and project scripts for development, command registration, debug output, and type checking.
- Added `website/index.html`, a static dark-fantasy landing page for Cloudflare Pages.
- Added project logo asset support.

### Changed

- Refactored bot command handling into modular command files.
- Improved sale notification formatting with branded embeds and cleaned league display names.
- Improved stats formatting with capitalized currencies, trophy styling for largest sale, proportional progress bars, and approximate value formatting.
- Changed converted values to use an approximate marker so estimates are clearly marked as estimates.
- Updated README feature and roadmap sections for the v0.4 alpha command set.
- Updated `.env.example` with settings for Discord dev users, poe.ninja estimates, logo URL, and placeholder OAuth fields.

### Fixed

- Fixed inconsistent `salesvault` import casing.
- Fixed TypeScript command builder typing for slash commands with options and subcommands.
- Fixed poe.ninja league casing issues by normalizing display names separately from raw API values.
- Fixed notification league display so `RUnes of Aldur` displays as `Runes of Aldur`.

### Security and Safety

- Restricted `/dev` tooling to Discord administrators and optional `DISCORD_DEV_USER_IDS`.
- Fake sale notifications do not write to the sales database.
- Official GGG OAuth exchange integration remains disabled unless explicitly enabled for approved testing.
- Maintained read-only project behavior: no gameplay automation, no client control, and no trade actions.

### Known Limitations

- poe.ninja estimates are third-party market estimates, not official GGG data.
- Official GGG OAuth/app registration is still pending and treated as placeholder work.
- Listing-to-sale time insights are unavailable until PoE2Watch stores listing timestamps.
- Multi-user support is not implemented yet.
- Hosted/cloud bot support is not implemented yet.

### Upgrade Notes

- Re-register Discord commands after updating:

```bash
npm run register
```

- Restart the bot after updating:

```bash
npm run dev
```

- Optional dev command allowlist:

```env
DISCORD_DEV_USER_IDS=your_discord_user_id
```

- Optional third-party estimate configuration:

```env
POE_RATE_PROVIDER=poe-ninja
POE_NINJA_LEAGUE_NAME=Runes of Aldur
POE_NINJA_LEAGUE_SLUG=runesofaldur
```

## [v0.3-alpha] - Previous

### Added

- Added adaptive sale watcher.
- Added SQLite sale database.
- Added Discord bot connection.
- Added webhook sale notifications.
- Added duplicate sale detection.
- Added initial `/last5` command.
- Added local-first read-only trade history.
