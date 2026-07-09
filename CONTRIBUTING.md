# Contributing To PoE2Watch

Thanks for wanting to help. PoE2Watch is still alpha software, so the best contributions are focused, practical, and easy to review.

## Project Direction

PoE2Watch is a self-hosted Discord companion for Path of Exile 2 traders.

The project should stay:

- read-only
- self-hosted first
- useful before fancy
- respectful of Grinding Gear Games' ecosystem
- clear about what it is doing
- careful with user secrets

PoE2Watch should not automate gameplay, control the game client, perform trades, or guess at unsupported OAuth/cloud behavior before official guidance exists.

## Before Adding A Feature

Ask these questions first:

- Does it respect GGG's ecosystem?
- Is it read-only?
- Does it improve the player's actual trading experience?
- Does it keep PoE2Watch simple enough to understand?
- Does it avoid duplicating an existing command or feature?
- Would a daily user understand why this exists without needing an explanation?
- Can it be tested safely without real secrets?

If a feature overlaps with an existing command, prefer improving the existing command instead of adding another one. PoE2Watch should avoid duplicate dashboards, duplicate summaries, and commands that only repackage the same information.

## Good First Contributions

Useful contributions include:

- documentation fixes
- clearer setup instructions
- Discord embed polish
- small bug fixes
- safer error messages
- tests for formatting, goals, history, or statistics logic
- improvements that reduce secret exposure risk
- small refactors that make behavior easier to understand

Large architecture changes, hosted/cloud behavior, OAuth assumptions, multi-user support, or database rewrites should start as an issue or discussion first.

## Local Setup

Install dependencies:

```bash
npm install
```

Copy the environment template:

```bash
copy .env.example .env
```

Register Discord commands:

```bash
npm run register
```

Start locally:

```bash
npm run dev
```

Run the main check:

```bash
npm run typecheck
```

Run tests:

```bash
npm test
```

## Docker Setup

Docker is supported for users who do not want to run PoE2Watch directly on their main Node/npm setup.

```bash
docker compose build
docker compose run --rm poe2watch node node_modules/tsx/dist/cli.mjs src/registercommands.ts
docker compose up -d
```

Stop it with:

```bash
docker compose down
```

See [docs/docker.md](docs/docker.md) for the full Docker guide.

## Security Rules

Never commit or paste:

- `.env`
- `POE_COOKIE`
- `DISCORD_BOT_TOKEN`
- Discord webhook URLs
- local databases from `data/`
- `seen-sales.json`

Anyone with a Discord webhook URL can post messages into that channel. Treat webhook URLs like passwords.

Security issues should be reported through GitHub's Security tab, not public issues.

## Pull Request Checklist

Before opening a PR:

- Run `npm run typecheck`.
- Run `npm test`.
- Keep changes focused.
- Update docs when behavior changes.
- Avoid unrelated formatting churn.
- Do not include screenshots with private account, cookie, or webhook information.
- Confirm `.env`, `data/`, and local runtime files are not staged.
- Explain what changed and how you tested it.

## Style Notes

- Prefer clear code over clever code.
- Keep Discord output compact and readable.
- Use existing services and formatting helpers where possible.
- Keep OAuth-related code as placeholder-only until GGG confirms registration and scopes.
- Keep commands purposeful. If two commands answer the same question, merge or improve instead of duplicating.

## More Docs

- [README.md](README.md)
- [docs/overview.md](docs/overview.md)
- [docs/installation.md](docs/installation.md)
- [docs/commands.md](docs/commands.md)
- [docs/security.md](docs/security.md)
- [docs/development.md](docs/development.md)
