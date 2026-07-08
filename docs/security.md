# Security

PoE2Watch is a self-hosted alpha tool. Keep the sensitive pieces on your machine.

## Keep These Private

Never share:

- `POE_COOKIE`
- `DISCORD_BOT_TOKEN`
- Discord webhook URLs
- `.env`
- local SQLite databases from `data/`
- `seen-sales.json`

Anyone with your Discord webhook URL can post messages into that channel. Treat webhook URLs like passwords.

## Docker

Docker support is available for users who want PoE2Watch running in a container instead of directly on their main machine.

The Docker runtime is intentionally small:

- runs as a non-root user
- keeps build tools out of the final image
- removes npm, npx, yarn, and corepack from runtime
- keeps `.env` and `data/` outside the image

Docker does not make secrets harmless. The container still needs access to `.env` so PoE2Watch can connect to Discord and check completed sale history.

See [Docker](docker.md).

## OAuth Status

Official GGG OAuth is not implemented yet.

OAuth, inviteable bot support, and hosted PoE2Watch Cloud are future work pending confirmed app registration and guidance from Grinding Gear Games.

## Reporting Security Issues

Use GitHub's Security tab:

```text
https://github.com/Hyp3r12/PoE2Watch/security
```

Do not post secrets in public issues.

## Cloudflare Security Checklist

For `poe2watch.app`, enable these in Cloudflare:

- **SSL/TLS encryption mode:** Full (strict), once the Pages custom domain certificate is active.
- **Always Use HTTPS:** On.
- **HTTP Strict Transport Security (HSTS):** On after HTTPS is confirmed working for both `poe2watch.app` and `www.poe2watch.app`.
- **Bot Fight Mode:** Optional, but useful if the site starts seeing junk traffic.
- **Multifactor authentication:** On for the Cloudflare account.

The repo ships:

```text
website/.well-known/security.txt
website/_headers
SECURITY.md
```
