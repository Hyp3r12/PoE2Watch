# Security

PoE2Watch is designed as a local-first alpha tool.

## Keep These Private

Never share:

- `POE_COOKIE`
- `DISCORD_BOT_TOKEN`
- Discord webhook URLs
- `.env`
- local SQLite databases from `data/`
- `seen-sales.json`

Anyone with your Discord webhook URL can post messages into that channel. Treat webhook URLs like passwords.

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
