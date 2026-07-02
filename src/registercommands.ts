import "dotenv/config";
import { REST, Routes, SlashCommandBuilder } from "discord.js";

const token = process.env.DISCORD_BOT_TOKEN!;
const clientId = process.env.DISCORD_CLIENT_ID!;
const guildId = process.env.DISCORD_GUILD_ID!;

const commands = [
    new SlashCommandBuilder()
        .setName("last5")
        .setDescription("Show your last 5 PoE2 sales")
        .toJSON(),
];

async function main() {
    const rest = new REST({ version: "10" }).setToken(token);

    console.log("Registering slash commands...");

    await rest.put(Routes.applicationGuildCommands(clientId, guildId), {
        body: commands,
    });

    console.log("✅ Slash commands registered.");
}

main().catch(console.error);