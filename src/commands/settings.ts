import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import {
    DISPLAY_CURRENCIES,
    getSettings,
    normalizeDisplayCurrency,
    saveDisplayCurrency,
} from "../storage/settings";
import { refreshExchangeRates } from "../services/exchange";
import { getRateProviderLabel } from "../services/exchange";
import {
    brandEmbed,
    POE2WATCH_DANGER_COLOR,
    POE2WATCH_INFO_COLOR,
} from "../discord/theme";

export const data = new SlashCommandBuilder()
    .setName("settings")
    .setDescription("View or update PoE2Watch settings")
    .addSubcommand((subcommand) =>
        subcommand.setName("view").setDescription("View current PoE2Watch settings")
    )
    .addSubcommand((subcommand) =>
        subcommand
            .setName("display")
            .setDescription("Set how sale values should be displayed")
            .addStringOption((option) =>
                option
                    .setName("currency")
                    .setDescription("Choose the display currency")
                    .setRequired(true)
                    .addChoices(
                        ...DISPLAY_CURRENCIES.map((currency) => ({
                            name: currency,
                            value: currency,
                        }))
                    )
            )
    )
    .addSubcommand((subcommand) =>
        subcommand
            .setName("refresh-rates")
            .setDescription("Refresh cached third-party estimate rates")
    );

export async function execute(interaction: ChatInputCommandInteraction) {
    const subcommand = interaction.options.getSubcommand();

    if (subcommand === "view") {
        const settings = getSettings();

        await interaction.reply({
            embeds: [
                brandEmbed(
                    {
                            title: "[SETTINGS] PoE2Watch",
                        fields: [
                            {
                                name: "Display Currency",
                                value: `**${settings.display_currency}**`,
                                inline: true,
                            },
                            {
                                name: "Exchange Estimates",
                                value: `Using cached **${getRateProviderLabel()}** when available.\nOfficial GGG exchange support is still a placeholder pending app registration.`,
                                inline: false,
                            },
                        ],
                    },
                    POE2WATCH_INFO_COLOR
                ),
            ],
        });
        return;
    }

    if (subcommand === "display") {
        const requestedCurrency = interaction.options.getString("currency", true);
        const displayCurrency = normalizeDisplayCurrency(requestedCurrency);

        if (!displayCurrency) {
            await interaction.reply({
                embeds: [
                    brandEmbed(
                        {
                            title: "Unknown Setting",
                            description: `Use one of: ${DISPLAY_CURRENCIES.join(", ")}.`,
                        },
                        POE2WATCH_DANGER_COLOR
                    ),
                ],
                ephemeral: true,
            });
            return;
        }

        saveDisplayCurrency(displayCurrency);

        await interaction.reply({
            embeds: [
                brandEmbed(
                    {
                        title: "Display Updated",
                        description: `Sale values will now display as **${displayCurrency}**.`,
                    },
                    POE2WATCH_INFO_COLOR
                ),
            ],
            ephemeral: true,
        });
        return;
    }

    if (subcommand === "refresh-rates") {
        await interaction.deferReply({ ephemeral: true });

        try {
            const result = await refreshExchangeRates({ force: true });

            await interaction.editReply({
                embeds: [
                    brandEmbed(
                        {
                            title: result.refreshed ? "Rates Refreshed" : "Rates Not Refreshed",
                            description: result.refreshed
                                ? `Refreshed from **${result.provider}** and saved **${result.savedMarkets}** market(s).`
                                : result.reason,
                        },
                        result.refreshed ? POE2WATCH_INFO_COLOR : POE2WATCH_DANGER_COLOR
                    ),
                ],
            });
        } catch (error) {
            const message = error instanceof Error ? error.message : String(error);

            await interaction.editReply({
                embeds: [
                    brandEmbed(
                        {
                            title: "Exchange Refresh Failed",
                            description: message,
                        },
                        POE2WATCH_DANGER_COLOR
                    ),
                ],
            });
        }
    }
}
