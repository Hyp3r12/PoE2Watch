import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import { getTodaySummary } from "../services/statistics";

export const data = new SlashCommandBuilder()
    .setName("today")
    .setDescription("Show today's PoE2 sales summary");

export async function execute(interaction: ChatInputCommandInteraction) {
    await interaction.reply({
        embeds: [getTodaySummary()],
    });
}
