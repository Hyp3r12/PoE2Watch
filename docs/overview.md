# Overview

PoE2Watch is an open-source Discord companion for Path of Exile 2 traders.

It watches completed sale history, sends Discord notifications when items sell, stores local trade history in SQLite, and turns that history into useful analytics.

PoE2Watch is polling-based, not truly instant. It currently checks every 7 minutes after recent sale activity and every 20 minutes when idle. Rate limits or authentication issues can delay checks until the app is healthy again.

## Mission

PoE2Watch started from a pretty familiar feeling: logging off because you feel stuck, then wondering if anything sold while you were away.

Sometimes one trade is all it takes to get a build moving again. A good sale can mean the next upgrade, the next craft, or just a reason to log back in with a plan instead of staring at your stash.

The point of PoE2Watch is simple: keep you informed while it is running. It does not play the game for you, make trades for you, or try to replace logging in. It just keeps the waiting-in-the-dark part from feeling so dead.

## Trust Model

Until official GGG OAuth support is confirmed, PoE2Watch stays local-first and self-hosted.

```text
your machine
your Discord app
your Discord server
your PoE session cookie
your local SQLite database
```

You should never send your `.env`, `POE_COOKIE`, Discord bot token, webhook URL, or local database to anyone.

## What PoE2Watch Does

- Watches your own completed sale history.
- Sends near-real-time sale notifications to Discord through adaptive polling.
- Stores sales locally in SQLite.
- Shows stats, top sales, recent sales, searchable history, insights, and goals.
- Uses cached third-party market data for temporary value estimates when configured.

## What PoE2Watch Does Not Do

- It does not automate gameplay.
- It does not control the game client.
- It does not perform trades.
- It does not write to Path of Exile.
- It does not provide a hosted cloud bot yet.
- It does not implement OAuth until GGG confirms app registration and guidance.
