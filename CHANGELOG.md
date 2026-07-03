# Changelog

All notable changes to PoE2Watch will be documented in this file.

PoE2Watch follows a lightweight alpha release style while the project is still moving quickly.

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
