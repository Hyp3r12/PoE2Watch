import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import { getStatsSummary } from "../services/statistics";

export const data = new SlashCommandBuilder()
    .setName("stats")
    .setDescription("Show your all-time PoE2Watch stats");

export async function execute(interaction: ChatInputCommandInteraction) {
    await interaction.reply({
        embeds: [getStatsSummary()],
    });
}
