import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import { getLastSales } from "../storage/salesvault";
import { formatColoredSaleTitle, formatSaleDetails, getSaleDisplayColor } from "../services/statistics";
import { addThumbnail, brandEmbed, POE2WATCH_SALE_COLOR } from "../discord/theme";

export const data = new SlashCommandBuilder()
    .setName("last3")
    .setDescription("Show your last 3 PoE2 sales");

function buildRecentSaleEmbed(sale: any, index: number, total: number) {
    return addThumbnail(
        brandEmbed(
            {
                title: `Recent Sale ${index} of ${total}`,
                description: `${formatColoredSaleTitle(sale)}${formatSaleDetails(sale)}`,
            },
            getSaleDisplayColor(sale)
        ),
        sale.icon
    );
}

export async function execute(interaction: ChatInputCommandInteraction) {
    const sales = getLastSales(3) as any[];

    if (sales.length === 0) {
        await interaction.reply({
            embeds: [
                brandEmbed(
                    {
                        title: "Recent Sales",
                        description: "No sales found yet.",
                    },
                    POE2WATCH_SALE_COLOR
                ),
            ],
        });
        return;
    }

    await interaction.reply({
        embeds: [buildRecentSaleEmbed(sales[0], 1, sales.length)],
    });

    for (const [index, sale] of sales.slice(1).entries()) {
        await interaction.followUp({
            embeds: [buildRecentSaleEmbed(sale, index + 2, sales.length)],
        });
    }
}
