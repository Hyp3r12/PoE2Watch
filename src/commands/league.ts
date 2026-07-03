import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import { getLeagueSummary } from "../services/statistics";

export const data = new SlashCommandBuilder()
    .setName("league")
    .setDescription("Show your full league PoE2 sales summary");

export async function execute(interaction: ChatInputCommandInteraction) {
    await interaction.reply({
        embeds: [getLeagueSummary()],
    });
}
