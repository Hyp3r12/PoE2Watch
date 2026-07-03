import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import {
    formatColoredSaleTitle,
    formatSaleDetails,
    getSaleDisplayColor,
    getTopSales,
} from "../services/statistics";
import { addThumbnail, brandEmbed, POE2WATCH_TOP_COLOR } from "../discord/theme";

export const data = new SlashCommandBuilder()
    .setName("top")
    .setDescription("Show your top PoE2 sales")
    .addIntegerOption((option) =>
        option
            .setName("limit")
            .setDescription("How many sales to show, from 1 to 3")
            .setMinValue(1)
            .setMaxValue(3)
    )
    .addStringOption((option) =>
        option
            .setName("currency")
            .setDescription("Only include sales in this currency, like divine, exalted, or chaos")
    );

export async function execute(interaction: ChatInputCommandInteraction) {
    const limit = interaction.options.getInteger("limit") ?? 3;
    const currency = interaction.options.getString("currency") ?? undefined;
    const sales = getTopSales(limit, currency) as any[];

    if (sales.length === 0) {
        await interaction.reply({
            embeds: [
                brandEmbed(
                    {
                        title: currency ? `Top ${limit} ${currency} Sales` : `Top ${limit} PoE2 Sales`,
                        description: currency ? `No ${currency} sales found yet.` : "No sales found yet.",
                    },
                    POE2WATCH_TOP_COLOR
                ),
            ],
        });
        return;
    }

    const buildTopSaleEmbed = (sale: any, index: number) =>
        addThumbnail(
            brandEmbed(
                {
                    title: `Top Sale ${index} of ${sales.length}`,
                    description: `${formatColoredSaleTitle(sale)}${formatSaleDetails(sale)}`,
                    footer: {
                        text: currency
                            ? `PoE2Watch | Top ${sales.length} filtered by ${currency}`
                            : `PoE2Watch | Top ${sales.length} by estimated Divine value`,
                    },
                },
                getSaleDisplayColor(sale)
            ),
            sale.icon
        );

    await interaction.reply({
        embeds: [buildTopSaleEmbed(sales[0], 1)],
    });

    for (const [index, sale] of sales.slice(1).entries()) {
        await interaction.followUp({
            embeds: [buildTopSaleEmbed(sale, index + 2)],
        });
    }
}
