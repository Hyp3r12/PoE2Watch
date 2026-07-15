import "dotenv/config";
import {
    ChannelType,
    Client,
    GatewayIntentBits,
    Guild,
    GuildChannel,
    PermissionFlagsBits,
    PermissionsBitField,
} from "discord.js";

type RolePlan = {
    color?: number;
    hoist?: boolean;
    name: string;
    permissions?: bigint[];
};

type ChannelPlan = {
    category: string;
    name: string;
    topic?: string;
    type: ChannelType.GuildText;
};

const APPLY = process.argv.includes("--apply");
const SYNC_PERMISSIONS = process.argv.includes("--sync-permissions");
const guildId = process.env.COMMUNITY_GUILD_ID;
const token = process.env.DISCORD_BOT_TOKEN;

const roles: RolePlan[] = [
    { name: "Owner", color: 0xf5d27a, hoist: true },
    { name: "Admin", color: 0xd4af37, hoist: true },
    {
        name: "Moderator",
        color: 0x8b1e1e,
        hoist: true,
        permissions: [PermissionFlagsBits.ManageMessages, PermissionFlagsBits.ModerateMembers],
    },
    { name: "Contributor", color: 0xb8aa8a },
    { name: "Trusted Tester", color: 0x4aa3df },
    { name: "Community", color: 0x7f8c8d },
    { name: "Muted", color: 0x555555 },
    { name: "PoE2Watch Bot", color: 0xd4af37 },
];

const channels: ChannelPlan[] = [
    {
        category: "START HERE",
        name: "welcome",
        type: ChannelType.GuildText,
        topic: "Start here for PoE2Watch community info.",
    },
    {
        category: "START HERE",
        name: "rules",
        type: ChannelType.GuildText,
        topic: "Community rules and safety reminders.",
    },
    {
        category: "START HERE",
        name: "announcements",
        type: ChannelType.GuildText,
        topic: "Official PoE2Watch announcements.",
    },
    {
        category: "START HERE",
        name: "poe2watch-updates",
        type: ChannelType.GuildText,
        topic: "Release notes, docs updates, and project progress.",
    },
    {
        category: "START HERE",
        name: "faq",
        type: ChannelType.GuildText,
        topic: "Common questions about PoE2Watch setup, Docker, OAuth, and security.",
    },
    {
        category: "SUPPORT",
        name: "setup-help",
        type: ChannelType.GuildText,
        topic: "Get setup help. Never post cookies, tokens, webhook URLs, or .env files.",
    },
    {
        category: "SUPPORT",
        name: "bug-reports",
        type: ChannelType.GuildText,
        topic: "Report bugs. Use /health export when possible and review it before posting.",
    },
    {
        category: "SUPPORT",
        name: "feature-requests",
        type: ChannelType.GuildText,
        topic: "Suggest focused improvements for PoE2Watch.",
    },
    {
        category: "SUPPORT",
        name: "oauth-status",
        type: ChannelType.GuildText,
        topic: "GGG OAuth/app registration status and future hosted-bot notes.",
    },
    {
        category: "COMMUNITY",
        name: "general",
        type: ChannelType.GuildText,
        topic: "General PoE2Watch and PoE2 chat.",
    },
    {
        category: "COMMUNITY",
        name: "trade-talk",
        type: ChannelType.GuildText,
        topic: "Trade discussion, pricing, and market talk.",
    },
    {
        category: "COMMUNITY",
        name: "build-talk",
        type: ChannelType.GuildText,
        topic: "Build discussion and upgrade planning.",
    },
    {
        category: "COMMUNITY",
        name: "showcase",
        type: ChannelType.GuildText,
        topic: "Share screenshots, wins, and PoE2Watch setups.",
    },
    {
        category: "DEMO",
        name: "poe2watch-demo",
        type: ChannelType.GuildText,
        topic: "Public demo screenshots or webhook-only example posts.",
    },
    {
        category: "DEMO",
        name: "bot-commands-demo",
        type: ChannelType.GuildText,
        topic: "Locked until a safe demo bot exists.",
    },
    {
        category: "STAFF",
        name: "mod-chat",
        type: ChannelType.GuildText,
        topic: "Staff discussion.",
    },
    {
        category: "STAFF",
        name: "mod-log",
        type: ChannelType.GuildText,
        topic: "Moderator notes and bot logs.",
    },
];

const readOnlyCategories = new Set(["START HERE", "DEMO"]);
const staffCategories = new Set(["STAFF"]);

function requireConfig() {
    if (!token) {
        throw new Error("Missing DISCORD_BOT_TOKEN in .env.");
    }

    if (!guildId) {
        throw new Error("Missing COMMUNITY_GUILD_ID. Set it to the community server ID before running this script.");
    }
}

function logPlan(message: string) {
    console.log(`${APPLY ? "APPLY" : "DRY RUN"}  ${message}`);
}

function isGuildChannelWithPermissions(channel: unknown): channel is GuildChannel {
    return channel instanceof GuildChannel;
}

function getBaseChannelOverwrites(guild: Guild, category: string) {
    const everyone = guild.roles.everyone;
    const admin = guild.roles.cache.find((role) => role.name === "Admin");
    const moderator = guild.roles.cache.find((role) => role.name === "Moderator");
    const community = guild.roles.cache.find((role) => role.name === "Community");
    const botRole = guild.members.me?.roles.botRole;

    const overwrites = [];

    if (staffCategories.has(category)) {
        overwrites.push({
            id: everyone.id,
            deny: [PermissionFlagsBits.ViewChannel],
        });

        for (const role of [admin, moderator].filter(Boolean)) {
            overwrites.push({
                id: role!.id,
                allow: [
                    PermissionFlagsBits.ViewChannel,
                    PermissionFlagsBits.SendMessages,
                    PermissionFlagsBits.ReadMessageHistory,
                ],
            });
        }
    } else {
        overwrites.push({
            id: everyone.id,
            allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.ReadMessageHistory],
            deny: readOnlyCategories.has(category) ? [PermissionFlagsBits.SendMessages] : [],
        });

        if (community && !readOnlyCategories.has(category)) {
            overwrites.push({
                id: community.id,
                allow: [
                    PermissionFlagsBits.ViewChannel,
                    PermissionFlagsBits.SendMessages,
                    PermissionFlagsBits.ReadMessageHistory,
                ],
            });
        }

        for (const role of [admin, moderator].filter(Boolean)) {
            overwrites.push({
                id: role!.id,
                allow: [
                    PermissionFlagsBits.ViewChannel,
                    PermissionFlagsBits.SendMessages,
                    PermissionFlagsBits.ManageMessages,
                    PermissionFlagsBits.ReadMessageHistory,
                ],
            });
        }
    }

    if (botRole) {
        overwrites.push({
            id: botRole.id,
            allow: [
                PermissionFlagsBits.ViewChannel,
                PermissionFlagsBits.SendMessages,
                PermissionFlagsBits.EmbedLinks,
                PermissionFlagsBits.AttachFiles,
                PermissionFlagsBits.ReadMessageHistory,
            ],
        });
    }

    return overwrites;
}

function canCommunitySend(category: string, channelName?: string) {
    if (category === "SUPPORT" || category === "COMMUNITY") return true;
    if (category === "DEMO" && channelName === "poe2watch-demo") return false;
    return false;
}

function getLockedChannelOverwrites(guild: Guild, category: string, channelName?: string) {
    const everyone = guild.roles.everyone;
    const admin = guild.roles.cache.find((role) => role.name === "Admin");
    const moderator = guild.roles.cache.find((role) => role.name === "Moderator");
    const community = guild.roles.cache.find((role) => role.name === "Community");
    const botRole = guild.members.me?.roles.botRole;
    const overwrites = [];

    if (category === "START HERE") {
        overwrites.push({
            id: everyone.id,
            allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.ReadMessageHistory],
            deny: [PermissionFlagsBits.SendMessages],
        });
    } else {
        overwrites.push({
            id: everyone.id,
            deny: [PermissionFlagsBits.ViewChannel],
        });
    }

    if (community && !staffCategories.has(category)) {
        overwrites.push({
            id: community.id,
            allow: [
                PermissionFlagsBits.ViewChannel,
                PermissionFlagsBits.ReadMessageHistory,
                ...(canCommunitySend(category, channelName) ? [PermissionFlagsBits.SendMessages] : []),
            ],
            deny: canCommunitySend(category, channelName) ? [] : [PermissionFlagsBits.SendMessages],
        });
    }

    for (const role of [admin, moderator].filter(Boolean)) {
        overwrites.push({
            id: role!.id,
            allow: [
                PermissionFlagsBits.ViewChannel,
                PermissionFlagsBits.SendMessages,
                PermissionFlagsBits.ManageMessages,
                PermissionFlagsBits.ReadMessageHistory,
            ],
        });
    }

    if (botRole) {
        overwrites.push({
            id: botRole.id,
            allow: [
                PermissionFlagsBits.ViewChannel,
                PermissionFlagsBits.SendMessages,
                PermissionFlagsBits.EmbedLinks,
                PermissionFlagsBits.AttachFiles,
                PermissionFlagsBits.ReadMessageHistory,
            ],
        });
    }

    return overwrites;
}

async function ensureRoles(guild: Guild) {
    for (const plan of roles) {
        const existing = guild.roles.cache.find((role) => role.name === plan.name);

        if (existing) {
            logPlan(`Role exists: ${plan.name}`);
            continue;
        }

        logPlan(`Create role: ${plan.name}`);

        if (APPLY) {
            await guild.roles.create({
                name: plan.name,
                color: plan.color,
                hoist: plan.hoist ?? false,
                permissions: new PermissionsBitField(plan.permissions ?? []),
                reason: "PoE2Watch community server setup",
            });
        }
    }
}

async function ensureCategories(guild: Guild) {
    for (const category of [...new Set(channels.map((channel) => channel.category))]) {
        const existing = guild.channels.cache.find(
            (channel) => channel.type === ChannelType.GuildCategory && channel.name === category
        );

        if (existing) {
            logPlan(`Category exists: ${category}`);
            continue;
        }

        logPlan(`Create category: ${category}`);

        if (APPLY) {
            await guild.channels.create({
                name: category,
                type: ChannelType.GuildCategory,
                permissionOverwrites: getBaseChannelOverwrites(guild, category),
                reason: "PoE2Watch community server setup",
            });
        }
    }
}

async function ensureChannels(guild: Guild) {
    for (const plan of channels) {
        const existing = guild.channels.cache.find((channel) => channel.name === plan.name);

        if (existing) {
            logPlan(`Channel exists: #${plan.name}`);
            continue;
        }

        const parent = guild.channels.cache.find(
            (channel) => channel.type === ChannelType.GuildCategory && channel.name === plan.category
        );

        logPlan(`Create channel: #${plan.name} in ${plan.category}`);

        if (APPLY) {
            await guild.channels.create({
                name: plan.name,
                type: plan.type,
                parent: parent?.id,
                topic: plan.topic,
                permissionOverwrites: getBaseChannelOverwrites(guild, plan.category),
                reason: "PoE2Watch community server setup",
            });
        }
    }
}

async function syncPermissions(guild: Guild) {
    for (const categoryName of [...new Set(channels.map((channel) => channel.category))]) {
        const category = guild.channels.cache.find(
            (channel) => channel.type === ChannelType.GuildCategory && channel.name === categoryName
        );

        if (!category) {
            logPlan(`Skip missing category permissions: ${categoryName}`);
            continue;
        }

        logPlan(`Sync category permissions: ${categoryName}`);

        if (APPLY && isGuildChannelWithPermissions(category)) {
            await category.permissionOverwrites.set(
                getLockedChannelOverwrites(guild, categoryName),
                "PoE2Watch community permission sync"
            );
        }
    }

    for (const plan of channels) {
        const channel = guild.channels.cache.find((currentChannel) => currentChannel.name === plan.name);
        const parent = guild.channels.cache.find(
            (currentChannel) => currentChannel.type === ChannelType.GuildCategory && currentChannel.name === plan.category
        );

        if (!channel) {
            logPlan(`Skip missing channel permissions: #${plan.name}`);
            continue;
        }

        logPlan(`Sync channel permissions: #${plan.name}`);

        if (APPLY && isGuildChannelWithPermissions(channel)) {
            await channel.permissionOverwrites.set(
                getLockedChannelOverwrites(guild, plan.category, plan.name),
                "PoE2Watch community permission sync"
            );

            if ("setParent" in channel && parent && channel.parentId !== parent.id) {
                await channel.setParent(parent.id, { lockPermissions: false, reason: "PoE2Watch community setup" });
            }
        }
    }
}

async function main() {
    requireConfig();

    console.log("PoE2Watch community server setup");
    console.log(APPLY ? "Mode: APPLY" : "Mode: DRY RUN");
    console.log(SYNC_PERMISSIONS ? "Permission sync: ON" : "Permission sync: OFF");
    console.log(`Guild: ${guildId}`);
    console.log("");

    const client = new Client({ intents: [GatewayIntentBits.Guilds] });

    await client.login(token);

    try {
        const guild = await client.guilds.fetch(guildId!);
        await guild.members.fetchMe();
        await guild.roles.fetch();
        await guild.channels.fetch();

        await ensureRoles(guild);
        await guild.roles.fetch();

        await ensureCategories(guild);
        await guild.channels.fetch();

        await ensureChannels(guild);

        if (SYNC_PERMISSIONS) {
            await guild.channels.fetch();
            await syncPermissions(guild);
        }

        console.log("");
        console.log(APPLY ? "Community server setup applied." : "Dry run complete. Re-run with --apply to make changes.");
        console.log("Manual follow-up: enable Community mode, AutoMod, server verification, and assign staff roles in Discord.");
        console.log("If channels are locked behind the Community role, use Discord onboarding, a reaction-role bot, or manual role assignment.");
    } finally {
        client.destroy();
    }
}

main().catch((error) => {
    const code = typeof error === "object" && error && "code" in error ? (error as { code?: unknown }).code : undefined;
    const message = error instanceof Error ? error.message : String(error);

    if (code === 10004 || message.toLowerCase().includes("unknown guild")) {
        console.error("Unknown guild.");
        console.error("Make sure COMMUNITY_GUILD_ID is the server ID, not a channel ID.");
        console.error("Also make sure the Discord bot from DISCORD_BOT_TOKEN has been invited to that server.");
        console.error("The bot must be in the server before PoE2Watch can create roles or channels.");
        process.exitCode = 1;
        return;
    }

    console.error(message);
    process.exitCode = 1;
});
