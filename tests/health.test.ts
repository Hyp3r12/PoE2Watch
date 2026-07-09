import test from "node:test";
import assert from "node:assert/strict";
import { buildHealthExport } from "../src/services/health";

test("health export reports configured state without leaking secret values", () => {
    const previousEnv = { ...process.env };

    process.env.DISCORD_WEBHOOK_URL = "https://discord.com/api/webhooks/123/secret-webhook-token";
    process.env.DISCORD_BOT_TOKEN = "super-secret-bot-token";
    process.env.POE_COOKIE = "POESESSID=super-secret-session";
    process.env.DISCORD_CLIENT_ID = "123";
    process.env.DISCORD_GUILD_ID = "456";
    process.env.POE_LEAGUE = "Runes of Aldur";

    try {
        const report = buildHealthExport();

        assert.match(report, /discord_webhook_configured=yes/);
        assert.match(report, /discord_bot_token_configured=yes/);
        assert.match(report, /poe_cookie_configured=yes/);
        assert.doesNotMatch(report, /secret-webhook-token/);
        assert.doesNotMatch(report, /super-secret-bot-token/);
        assert.doesNotMatch(report, /super-secret-session/);
        assert.doesNotMatch(report, /POESESSID/);
    } finally {
        process.env = previousEnv;
    }
});
