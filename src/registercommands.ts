import "dotenv/config";
import { REST, Routes } from "discord.js";
import { commandDefinitions } from "./commands";

const token = process.env.DISCORD_BOT_TOKEN!;
const clientId = process.env.DISCORD_CLIENT_ID!;
const guildId = process.env.DISCORD_GUILD_ID!;

async function main() {
    const rest = new REST({ version: "10" }).setToken(token);

    console.log("Registering slash commands...");

    await rest.put(Routes.applicationGuildCommands(clientId, guildId), {
        body: commandDefinitions,
    });

    console.log("Slash commands registered.");
}

main().catch(console.error);
