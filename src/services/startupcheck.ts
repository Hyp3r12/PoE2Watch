import fs from "node:fs";
import db from "../storage/database";

type Check = {
    label: string;
    ok: boolean;
    required: boolean;
    help?: string;
};

function hasValue(value?: string | null) {
    return !!value && value.trim().length > 0;
}

function getDatabaseWritable() {
    try {
        db.pragma("quick_check", { simple: true });
        return true;
    } catch {
        return false;
    }
}

function formatCheck(check: Check) {
    const status = check.ok ? "OK" : check.required ? "MISSING" : "Optional";
    return `${status.padEnd(8)} ${check.label}${check.help && !check.ok ? ` - ${check.help}` : ""}`;
}

export function buildStartupChecks(): Check[] {
    return [
        {
            label: ".env file",
            ok: fs.existsSync(".env"),
            required: true,
            help: "copy .env.example to .env",
        },
        {
            label: "DISCORD_BOT_TOKEN",
            ok: hasValue(process.env.DISCORD_BOT_TOKEN),
            required: true,
            help: "required for slash commands",
        },
        {
            label: "DISCORD_CLIENT_ID",
            ok: hasValue(process.env.DISCORD_CLIENT_ID),
            required: true,
            help: "required when registering slash commands",
        },
        {
            label: "DISCORD_GUILD_ID",
            ok: hasValue(process.env.DISCORD_GUILD_ID),
            required: true,
            help: "required when registering slash commands",
        },
        {
            label: "DISCORD_WEBHOOK_URL",
            ok: hasValue(process.env.DISCORD_WEBHOOK_URL),
            required: true,
            help: "required for sale notifications",
        },
        {
            label: "POE_COOKIE",
            ok: hasValue(process.env.POE_COOKIE),
            required: true,
            help: "required for completed sale history checks",
        },
        {
            label: "POE_LEAGUE",
            ok: hasValue(process.env.POE_LEAGUE),
            required: true,
            help: "example: Runes of Aldur",
        },
        {
            label: "SQLite database",
            ok: getDatabaseWritable(),
            required: true,
            help: "data/sales.db must be writable",
        },
        {
            label: "POE_RATE_PROVIDER",
            ok: hasValue(process.env.POE_RATE_PROVIDER),
            required: false,
            help: "defaults to poe-ninja",
        },
        {
            label: "POE2WATCH_LOGO_URL",
            ok: hasValue(process.env.POE2WATCH_LOGO_URL),
            required: false,
            help: "defaults to poe2watch.app logo",
        },
    ];
}

export function printStartupCheck() {
    const checks = buildStartupChecks();
    const missingRequired = checks.filter((check) => check.required && !check.ok);

    console.log("");
    console.log("PoE2Watch setup check");
    console.log("---------------------");

    for (const check of checks) {
        console.log(formatCheck(check));
    }

    console.log("");

    if (missingRequired.length > 0) {
        console.log("Missing required setup:");

        for (const check of missingRequired) {
            console.log(`- ${check.label}${check.help ? ` (${check.help})` : ""}`);
        }

        console.log("");
        console.log("Fix .env, then restart PoE2Watch.");
    } else {
        console.log("Setup looks ready.");
    }

    console.log("If slash commands do not appear in Discord, run:");
    console.log("npm run register");
    console.log("Docker:");
    console.log("docker compose run --rm poe2watch node node_modules/tsx/dist/cli.mjs src/registercommands.ts");
    console.log("");
}
