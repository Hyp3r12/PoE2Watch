import test from "node:test";
import assert from "node:assert/strict";
import { buildStartupChecks } from "../src/services/startupcheck";

test("startup checks report missing required configuration by label only", () => {
    const previousEnv = { ...process.env };

    delete process.env.DISCORD_BOT_TOKEN;
    delete process.env.POE_COOKIE;

    try {
        const checks = buildStartupChecks();
        const botToken = checks.find((check) => check.label === "DISCORD_BOT_TOKEN");
        const poeCookie = checks.find((check) => check.label === "POE_COOKIE");

        assert.equal(botToken?.ok, false);
        assert.equal(botToken?.required, true);
        assert.equal(poeCookie?.ok, false);
        assert.equal(poeCookie?.required, true);
    } finally {
        process.env = previousEnv;
    }
});

test("startup checks do not expose configured secret values", () => {
    const previousEnv = { ...process.env };

    process.env.DISCORD_BOT_TOKEN = "super-secret-token";
    process.env.POE_COOKIE = "POESESSID=super-secret-session";

    try {
        const serialized = JSON.stringify(buildStartupChecks());

        assert.doesNotMatch(serialized, /super-secret-token/);
        assert.doesNotMatch(serialized, /super-secret-session/);
        assert.doesNotMatch(serialized, /POESESSID/);
    } finally {
        process.env = previousEnv;
    }
});
