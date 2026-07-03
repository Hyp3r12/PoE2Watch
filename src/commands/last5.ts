import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import { getLastSales } from "../storage/salesvault";
import { formatSaleLine } from "../services/statistics";
import { addThumbnail, brandEmbed, POE2WATCH_SALE_COLOR } from "../discord/theme";

export const data = new SlashCommandBuilder()
    .setName("last5")
    .setDescription("Show your last 5 PoE2 sales");

export async function execute(interaction: ChatInputCommandInteraction) {
    const sales = getLastSales(5) as any[];

    if (sales.length === 0) {
        await interaction.reply({
            embeds: [
                brandEmbed(
                    {
                        title: "[RECENT] Last 5 PoE2 Sales",
                        description: "No sales found yet.",
                    },
                    POE2WATCH_SALE_COLOR
                ),
            ],
        });
        return;
    }

    const description = sales
        .map((sale, index) => {
            return formatSaleLine(sale, index + 1);
        })
        .join("\n\n");

    await interaction.reply({
        embeds: [
            addThumbnail(
                brandEmbed(
                    {
                        title: "[RECENT] Last 5 PoE2 Sales",
                        description,
                    },
                    POE2WATCH_SALE_COLOR
                ),
                sales[0]?.icon
            ),
        ],
    });
}
