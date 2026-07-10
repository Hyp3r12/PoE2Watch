import "dotenv/config";
import "./storage/database";
import { ChatInputCommandInteraction, Client, GatewayIntentBits, Events } from "discord.js";
import { commandHandlers } from "./commands";
import { brandEmbed, EPHEMERAL_RESPONSE, POE2WATCH_DANGER_COLOR } from "./discord/theme";

const token = process.env.DISCORD_BOT_TOKEN;

if (!token) {
    throw new Error("DISCORD_BOT_TOKEN is missing from .env");
}

const client = new Client({
    intents: [GatewayIntentBits.Guilds],
});

function isInteractionAlreadyAcknowledged(error: unknown) {
    return (
        typeof error === "object" &&
        error !== null &&
        "code" in error &&
        (error as { code?: unknown }).code === 40060
    );
}

async function sendCommandFailure(interaction: ChatInputCommandInteraction) {
    const response = {
        embeds: [
            brandEmbed(
                {
                    title: "Command Failed",
                    description: "That command failed. Check the app logs for details.",
                },
                POE2WATCH_DANGER_COLOR
            ),
        ],
        flags: EPHEMERAL_RESPONSE,
    };

    try {
        if (interaction.replied || interaction.deferred) {
            await interaction.followUp(response);
        } else {
            await interaction.reply(response);
        }
    } catch (error) {
        if (isInteractionAlreadyAcknowledged(error)) {
            console.warn("Command failure response skipped because the interaction was already acknowledged.");
            return;
        }

        throw error;
    }
}

client.once(Events.ClientReady, (readyClient) => {
    console.log(`PoE2Watch bot online as ${readyClient.user.tag}`);
});

client.on(Events.InteractionCreate, async (interaction) => {
    if (!interaction.isChatInputCommand()) return;

    const execute = commandHandlers.get(interaction.commandName);

    if (!execute) {
        await interaction.reply({
            embeds: [
                brandEmbed(
                    {
                        title: "Unknown Command",
                        description: "That command is not registered in PoE2Watch.",
                    },
                    POE2WATCH_DANGER_COLOR
                ),
            ],
            flags: EPHEMERAL_RESPONSE,
        });
        return;
    }

    try {
        await execute(interaction);
    } catch (error) {
        console.error(`Command failed: ${interaction.commandName}`, error);

        await sendCommandFailure(interaction);
    }
});

client.login(token);
