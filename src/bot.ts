import "dotenv/config";
import "./storage/database";
import { Client, GatewayIntentBits, Events } from "discord.js";
import { commandHandlers } from "./commands";

const token = process.env.DISCORD_BOT_TOKEN;

if (!token) {
    throw new Error("DISCORD_BOT_TOKEN is missing from .env");
}

const client = new Client({
    intents: [GatewayIntentBits.Guilds],
});

client.once(Events.ClientReady, (readyClient) => {
    console.log(`PoE2Watch bot online as ${readyClient.user.tag}`);
});

client.on(Events.InteractionCreate, async (interaction) => {
    if (!interaction.isChatInputCommand()) return;

    const execute = commandHandlers.get(interaction.commandName);

    if (!execute) {
        await interaction.reply({
            content: "Unknown command.",
            ephemeral: true,
        });
        return;
    }

    try {
        await execute(interaction);
    } catch (error) {
        console.error(`Command failed: ${interaction.commandName}`, error);

        const response = {
            content: "That command failed. Check the app logs for details.",
            ephemeral: true,
        };

        if (interaction.replied || interaction.deferred) {
            await interaction.followUp(response);
        } else {
            await interaction.reply(response);
        }
    }
});

client.login(token);
