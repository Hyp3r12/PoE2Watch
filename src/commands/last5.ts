import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import { getLastSales } from "../storage/salesvault";

export const data = new SlashCommandBuilder()
    .setName("last5")
    .setDescription("Show your last 5 PoE2 sales");

export async function execute(interaction: ChatInputCommandInteraction) {
    const sales = getLastSales(5) as any[];

    if (sales.length === 0) {
        await interaction.reply("No sales found yet.");
        return;
    }

    const description = sales
        .map((sale, index) => {
            return `**${index + 1}. ${sale.item_name}**\nSold for **${sale.price_amount} ${sale.price_currency}**\n${sale.sold_at}`;
        })
        .join("\n\n");

    await interaction.reply({
        embeds: [
            {
                title: "Last 5 PoE2 Sales",
                description,
            },
        ],
    });
}
