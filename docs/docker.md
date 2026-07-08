# Docker

Docker support is meant for people who want to run PoE2Watch without installing Node/npm directly on their main machine.

It still uses your `.env`, and the app inside the container can still read the values it needs to work. Docker is not magic security, but it gives PoE2Watch a cleaner, more isolated place to run.

## What Docker Keeps Outside The Image

These stay on your machine:

```text
.env
data/
```

`.env` stores your Discord and PoE settings.

`data/` stores the local SQLite database.

## Requirements

- Docker Desktop on Windows/macOS, or Docker Engine on Linux.
- A completed `.env` file.
- A Discord app/bot and webhook.

## First Run

Copy the environment template if you have not already:

```bash
copy .env.example .env
```

Fill in `.env`, then build the container:

```bash
docker compose build
```

Do not paste `docker compose config` output publicly. Docker Compose expands env-file values in that output, including bot tokens, webhook URLs, and PoE session cookies.

Register Discord slash commands:

```bash
docker compose run --rm poe2watch node node_modules/tsx/dist/cli.mjs src/registercommands.ts
```

Start PoE2Watch:

```bash
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

## Updating

After pulling new code:

```bash
docker compose build
docker compose up -d
```

If commands changed, register them again:

```bash
docker compose run --rm poe2watch node node_modules/tsx/dist/cli.mjs src/registercommands.ts
```

## Raspberry Pi / Small Server Notes

Docker should work well for an always-on Raspberry Pi or home server setup.

`better-sqlite3` is a native dependency, so the Docker build stage includes basic build tools for platforms that need to compile it during install. Those tools are not copied into the final runtime image.

The runtime image intentionally does not include npm or yarn. This keeps the container smaller and reduces vulnerability scanner noise from package-manager internals.

## Security Notes

- Do not copy `.env` into the image.
- Do not commit `.env`.
- Do not commit `data/`.
- Treat `POE_COOKIE`, Discord bot tokens, and webhook URLs like passwords.
- If you run this on a VPS, understand that your PoE session cookie will live on that server.
- Do not share `docker compose config` output unless you have scrubbed it first.
