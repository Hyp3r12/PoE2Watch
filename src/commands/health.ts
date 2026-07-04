import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import { brandEmbed, POE2WATCH_INFO_COLOR } from "../discord/theme";
import { buildHealthFields } from "../services/health";

export const data = new SlashCommandBuilder()
    .setName("health")
    .setDescription("Show PoE2Watch setup and runtime status");

export async function execute(interaction: ChatInputCommandInteraction) {
    await interaction.reply({
        embeds: [
            brandEmbed(
                {
                    title: "PoE2Watch Health",
                    description: "Local setup and watcher status. No secrets are shown.",
                    fields: buildHealthFields(),
                },
                POE2WATCH_INFO_COLOR
            ),
        ],
        ephemeral: true,
    });
}
