# PoE2Watch Vision

## Why PoE2Watch Exists

Path of Exile is built around long-term progression.

Players spend hours farming maps, bosses, and league mechanics looking for valuable items to sell.

The problem is what happens after those items are listed.

Most players log off.

Hours later they wonder:

"Did anything sell?"

Many never log back in because they simply don't know.

PoE2Watch exists to solve that problem.

---

## Our Goal

Turn uncertainty into excitement.

Instead of logging in hoping something sold...

Players log in knowing they have currency waiting for them.

That changes the entire experience.

A single Discord notification can turn:

"I don't really feel like playing."

into

"I just sold my Headhunter.
I'm finally buying that upgrade."

PoE2Watch reconnects players with the game at exactly the right moment.

---

## Principles

### Read Only

PoE2Watch never automates gameplay.

It never interacts with the game client.

It never performs trades.

It simply presents information the player already owns.

---

### Respect Grinding Gear Games

PoE2Watch exists because of Path of Exile.

We will follow GGG's API policies, authentication model, and rate limits.

Whenever possible we will use official APIs instead of browser sessions.

---

### Player First

Every feature should answer one question:

"Does this help the player enjoy Path of Exile more?"

If the answer is no...

It probably doesn't belong.

---

## Roadmap

Current

✓ Sale notifications

✓ Discord integration

✓ SQLite history

✓ Slash commands

Future

• OAuth authentication

• Daily / Weekly / Monthly summaries

• Lifetime trade analytics

• Profit tracking

• Wealth tracking

• Trading goals

• Multi-user support

• Guild support

• Web dashboard

• Desktop companion

---

## Release Direction

### v0.5 - Trading Experience

The next major focus is making PoE2Watch feel better for a single trader using Discord every day.

Planned:

• Inventory tracking

• Goals

• Better Discord embeds

• Slash command autocomplete

• Pagination

• Statistics export

• `/wealth`

### v0.6 - Multi User

After the single-user trading experience is strong, PoE2Watch should support more users and servers.

Planned:

• PostgreSQL

• Multiple guilds

• User accounts

• Inviteable bot

### v0.7 - Website

The website should become more than a landing page.

Planned:

• Login

• Dashboard

• Public stats

• API

### v1.0 - Cloud

The long-term goal is hosted PoE2Watch.

Planned:

• Hosted PoE2Watch

• OAuth, if supported and approved

• Managed inviteable bot

---

## Architecture Direction

PoE2Watch should eventually centralize configuration instead of reading `process.env` across the codebase.

The planned shape is:

`src/config/config.ts`

with sections for:

• Discord

• Polling

• Exchange estimates

• OAuth placeholders

• Website links

• Database

The statistics service should also split as the analytics layer grows:

• summary

• leaderboards

• insights

• charts

• formatter

---

## Long-Term Vision

PoE2Watch is not intended to replace Path of Exile.

It is intended to become the companion application players leave open while they live their lives.

Whether they're at work...

Watching TV...

Or spending time with family...

PoE2Watch quietly watches for completed sales.

When something important happens...

It lets them know.

Then they're free to jump back into Wraeclast with a purpose.

Not because they hope something sold...

But because they already know it did.
