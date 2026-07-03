import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import { getTopSalesSummary } from "../services/statistics";

export const data = new SlashCommandBuilder()
    .setName("top")
    .setDescription("Show your top PoE2 sales")
    .addIntegerOption((option) =>
        option
            .setName("limit")
            .setDescription("How many sales to show, from 1 to 10")
            .setMinValue(1)
            .setMaxValue(10)
    )
    .addStringOption((option) =>
        option
            .setName("currency")
            .setDescription("Only include sales in this currency, like divine, exalted, or chaos")
    );

export async function execute(interaction: ChatInputCommandInteraction) {
    const limit = interaction.options.getInteger("limit") ?? 5;
    const currency = interaction.options.getString("currency") ?? undefined;

    await interaction.reply({
        embeds: [getTopSalesSummary(limit, currency)],
    });
}
