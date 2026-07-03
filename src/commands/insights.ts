import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import { getInsightsSummary } from "../services/statistics";

export const data = new SlashCommandBuilder()
    .setName("insights")
    .setDescription("Show trading insights from your PoE2Watch sale history");

export async function execute(interaction: ChatInputCommandInteraction) {
    await interaction.reply({
        embeds: [getInsightsSummary()],
    });
}
