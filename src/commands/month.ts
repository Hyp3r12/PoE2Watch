import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import { getMonthSummary } from "../services/statistics";

export const data = new SlashCommandBuilder()
    .setName("month")
    .setDescription("Show your last 30 days PoE2 sales summary");

export async function execute(interaction: ChatInputCommandInteraction) {
    await interaction.reply({
        embeds: [getMonthSummary()],
    });
}
