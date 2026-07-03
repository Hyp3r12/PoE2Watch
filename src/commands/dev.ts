import { ChatInputCommandInteraction, PermissionFlagsBits, SlashCommandBuilder } from "discord.js";
import { notifyDiscord } from "../discord/webhook";
import { fetchSales, PoeSale } from "../poe/api";
import { canUseDevCommands } from "../services/devpermissions";
import { brandEmbed, POE2WATCH_DANGER_COLOR, POE2WATCH_INFO_COLOR } from "../discord/theme";
import { getFrameTypeFromRarity, normalizeRarity } from "../services/rarity";
import { hasSale, updateSaleMetadata } from "../storage/salesvault";

export const data = new SlashCommandBuilder()
    .setName("dev")
    .setDescription("Developer-only PoE2Watch test tools")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addSubcommand((subcommand) =>
        subcommand
            .setName("fake-sale")
            .setDescription("Send a fake sale notification without saving it")
            .addStringOption((option) =>
                option
                    .setName("item")
                    .setDescription("Fake item name")
                    .setRequired(false)
            )
            .addNumberOption((option) =>
                option
                    .setName("amount")
                    .setDescription("Fake sale amount")
                    .setMinValue(0.01)
                    .setRequired(false)
            )
            .addStringOption((option) =>
                option
                    .setName("currency")
                    .setDescription("Fake sale currency")
                    .setRequired(false)
                    .addChoices(
                        { name: "Divine", value: "divine" },
                        { name: "Exalted", value: "exalted" },
                        { name: "Chaos", value: "chaos" }
                    )
            )
            .addStringOption((option) =>
                option
                    .setName("rarity")
                    .setDescription("Fake item rarity")
                    .setRequired(false)
                    .addChoices(
                        { name: "Normal", value: "normal" },
                        { name: "Magic", value: "magic" },
                        { name: "Rare", value: "rare" },
                        { name: "Unique", value: "unique" }
                    )
            )
    )
    .addSubcommand((subcommand) =>
        subcommand
            .setName("refresh-sale-metadata")
            .setDescription("Backfill item icons, rarity, and item details for recent known sales")
    );

function buildFakeSale(interaction: ChatInputCommandInteraction): PoeSale {
    const itemName = interaction.options.getString("item") ?? "Headhunter Heavy Belt";
    const amount = interaction.options.getNumber("amount") ?? 299;
    const currency = interaction.options.getString("currency") ?? "divine";
    const rarity = normalizeRarity(interaction.options.getString("rarity") ?? "unique");

    return {
        time: new Date().toISOString(),
        item_id: `dev-test-${Date.now()}`,
        item: {
            name: rarity === "rare" ? "Dragon Knuckle" : undefined,
            typeLine: itemName,
            ilvl: 82,
            properties: [{ name: "Quality", values: [["+20%", 1]], displayMode: 0 }],
            explicitMods: [
                "22% increased [AttackSpeed|Attack Speed]",
                "+84 to maximum [Life|Life]",
                "+38% to [Fire|Fire Resistance]",
            ],
            frameType: getFrameTypeFromRarity(rarity),
            icon: process.env.POE2WATCH_LOGO_URL || undefined,
            rarity,
        },
        price: {
            amount,
            currency,
        },
    };
}

export async function execute(interaction: ChatInputCommandInteraction) {
    if (!canUseDevCommands(interaction)) {
        await interaction.reply({
            embeds: [
                brandEmbed(
                    {
                        title: "Developer Command Locked",
                        description: "Only server administrators or allowlisted dev users can use this command.",
                    },
                    POE2WATCH_DANGER_COLOR
                ),
            ],
            ephemeral: true,
        });
        return;
    }

    const subcommand = interaction.options.getSubcommand();

    if (subcommand === "fake-sale") {
        await interaction.deferReply({ ephemeral: true });

        const sale = buildFakeSale(interaction);
        await notifyDiscord(sale, { testMode: true });

        await interaction.editReply({
            embeds: [
                brandEmbed(
                    {
                        title: "Fake Sale Sent",
                        description: "A test sale notification was sent. It was not saved to the sales database.",
                    },
                    POE2WATCH_INFO_COLOR
                ),
            ],
        });
        return;
    }

    if (subcommand === "refresh-sale-metadata") {
        await interaction.deferReply({ ephemeral: true });

        try {
            const sales = await fetchSales();
            let updated = 0;

            for (const sale of sales) {
                if (!hasSale(sale)) continue;

                updateSaleMetadata(sale);
                updated += 1;
            }

            await interaction.editReply({
                embeds: [
                    brandEmbed(
                        {
                            title: "Sale Metadata Refreshed",
                            description: `Checked **${sales.length}** recent sale(s) and refreshed metadata for **${updated}** known sale(s).`,
                        },
                        POE2WATCH_INFO_COLOR
                    ),
                ],
            });
        } catch (error) {
            const message = error instanceof Error ? error.message : String(error);

            await interaction.editReply({
                embeds: [
                    brandEmbed(
                        {
                            title: "Metadata Refresh Failed",
                            description: message,
                        },
                        POE2WATCH_DANGER_COLOR
                    ),
                ],
            });
        }
    }
}
