import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import { addThumbnail, brandEmbed, POE2WATCH_HISTORY_COLOR } from "../discord/theme";
import { formatColoredSaleTitle, formatSaleDetails, getSaleDisplayColor } from "../services/statistics";
import { searchSalesHistory } from "../services/history";

export const data = new SlashCommandBuilder()
    .setName("history")
    .setDescription("Search your local PoE2 sale history")
    .addSubcommand((subcommand) =>
        subcommand
            .setName("search")
            .setDescription("Search sold items by name or type")
            .addStringOption((option) =>
                option
                    .setName("query")
                    .setDescription("Item name or type to search for, like ring, belt, or Headhunter")
                    .setRequired(true)
            )
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
            )
            .addIntegerOption((option) =>
                option
                    .setName("days")
                    .setDescription("Only include sales from the last X days")
                    .setMinValue(1)
                    .setMaxValue(365)
            )
    );

function buildHistoryEmbed(sale: any, index: number, total: number, query: string) {
    return addThumbnail(
        brandEmbed(
            {
                title: `History Result ${index} of ${total}`,
                description: `${formatColoredSaleTitle(sale)}${formatSaleDetails(sale)}`,
                footer: {
                    text: `PoE2Watch | Search: ${query}`,
                },
            },
            getSaleDisplayColor(sale)
        ),
        sale.icon
    );
}

export async function execute(interaction: ChatInputCommandInteraction) {
    const subcommand = interaction.options.getSubcommand();

    if (subcommand !== "search") return;

    const query = interaction.options.getString("query", true);
    const limit = interaction.options.getInteger("limit") ?? 3;
    const currency = interaction.options.getString("currency");
    const days = interaction.options.getInteger("days");
    const sales = searchSalesHistory({ query, limit, currency, days }) as any[];

    if (sales.length === 0) {
        const filters = [
            currency ? `currency: **${currency}**` : null,
            days ? `last **${days}** day(s)` : null,
        ].filter(Boolean);

        await interaction.reply({
            embeds: [
                brandEmbed(
                    {
                        title: "No History Results",
                        description: `No sales matched **${query}**${filters.length ? ` with ${filters.join(", ")}` : ""}.`,
                    },
                    POE2WATCH_HISTORY_COLOR
                ),
            ],
        });
        return;
    }

    await interaction.reply({
        embeds: [buildHistoryEmbed(sales[0], 1, sales.length, query)],
    });

    for (const [index, sale] of sales.slice(1).entries()) {
        await interaction.followUp({
            embeds: [buildHistoryEmbed(sale, index + 2, sales.length, query)],
        });
    }
}
