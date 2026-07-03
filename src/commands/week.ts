import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import { getWeekSummary } from "../services/statistics";

export const data = new SlashCommandBuilder()
    .setName("week")
    .setDescription("Show your last 7 days PoE2 sales summary");

export async function execute(interaction: ChatInputCommandInteraction) {
    await interaction.reply({
        embeds: [getWeekSummary()],
    });
}
