# Security Policy

PoE2Watch is a local-first, self-hosted Path of Exile 2 trade notification companion.

## Reporting Security Issues

Please report suspected security issues through GitHub's Security tab:

https://github.com/Hyp3r12/PoE2Watch/security

Do not post secrets, session cookies, Discord bot tokens, webhook URLs, or private `.env` contents in public issues.

## Secret Handling

Never share:

- `POE_COOKIE`
- `DISCORD_BOT_TOKEN`
- Discord webhook URLs
- `.env`
- local SQLite databases from `data/`

PoE2Watch is designed to run locally until official GGG OAuth support is confirmed.

## Supported Versions

The current public alpha line is:

```text
v0.5.x-alpha
```

Security fixes should target the latest alpha unless otherwise noted.
