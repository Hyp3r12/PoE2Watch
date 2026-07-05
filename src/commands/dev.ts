import { ChatInputCommandInteraction, PermissionFlagsBits, SlashCommandBuilder } from "discord.js";
import { notifyDiscord } from "../discord/webhook";
import { fetchSales, PoeSale } from "../poe/api";
import { canUseDevCommands } from "../services/devpermissions";
import { brandEmbed, EPHEMERAL_RESPONSE, POE2WATCH_DANGER_COLOR, POE2WATCH_INFO_COLOR } from "../discord/theme";
import { getFrameTypeFromRarity, normalizeRarity } from "../services/rarity";
import { getLastSales, hasSale, updateSaleMetadata } from "../storage/salesvault";

type StoredSaleTemplate = {
    id: string;
    item_name: string;
    item_type: string;
    item_frame_type?: number | null;
    item_rarity?: string | null;
    icon?: string | null;
    item_json?: string | null;
    price_amount: number;
    price_currency: string;
    sold_at: string;
};

export const data = new SlashCommandBuilder()
    .setName("dev")
    .setDescription("Developer-only PoE2Watch test tools")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addSubcommand((subcommand) =>
        subcommand
            .setName("fake-sale")
            .setDescription("Send a real-style test sale notification without saving it")
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

function getLatestSaleTemplate(): PoeSale | null {
    const latest = getLastSales(1)[0] as StoredSaleTemplate | undefined;

    if (!latest) return null;

    let item: PoeSale["item"] | null = null;

    if (latest.item_json) {
        try {
            item = JSON.parse(latest.item_json) as PoeSale["item"];
        } catch {
            item = null;
        }
    }

    return {
        time: new Date().toISOString(),
        item_id: `dev-test-${Date.now()}`,
        item: item ?? {
            typeLine: latest.item_type || latest.item_name,
            frameType: latest.item_frame_type ?? undefined,
            icon: latest.icon ?? undefined,
            rarity: latest.item_rarity ?? undefined,
        },
        price: {
            amount: latest.price_amount,
            currency: latest.price_currency,
        },
    };
}

function buildFallbackFakeSale(): PoeSale {
    const rarity = normalizeRarity("unique");

    return {
        time: new Date().toISOString(),
        item_id: `dev-test-${Date.now()}`,
        item: {
            typeLine: "Headhunter Heavy Belt",
            baseType: "Heavy Belt",
            w: 2,
            h: 1,
            ilvl: 82,
            requirements: [{ name: "Level", values: [["40", 0]], displayMode: 0 }],
            implicitMods: ["+(20-30) to [Strength|Strength]"],
            explicitMods: [
                "+(40-55) to [Strength|Strength]",
                "+(40-55) to [Dexterity|Dexterity]",
                "+(50-60) to maximum [Life|Life]",
                "(20-30)% increased [Damage|Damage] with Hits against Rare monsters",
                "When you Kill a Rare monster, you gain its Modifiers for 20 seconds",
            ],
            frameType: getFrameTypeFromRarity(rarity),
            rarity,
        },
        price: { amount: 299, currency: "divine" },
    };
}

function buildFakeSale(interaction: ChatInputCommandInteraction): PoeSale {
    const sale = getLatestSaleTemplate() ?? buildFallbackFakeSale();
    const itemName = interaction.options.getString("item");
    const amount = interaction.options.getNumber("amount");
    const currency = interaction.options.getString("currency");
    const rarityOption = interaction.options.getString("rarity");

    if (itemName) {
        sale.item = {
            ...sale.item,
            name: undefined,
            typeLine: itemName,
        };
    }

    if (amount) {
        sale.price.amount = amount;
    }

    if (currency) {
        sale.price.currency = currency;
    }

    if (rarityOption) {
        const rarity = normalizeRarity(rarityOption);
        sale.item.rarity = rarity;
        sale.item.frameType = getFrameTypeFromRarity(rarity);
    }

    return sale;
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
            flags: EPHEMERAL_RESPONSE,
        });
        return;
    }

    const subcommand = interaction.options.getSubcommand();

    if (subcommand === "fake-sale") {
        await interaction.deferReply({ flags: EPHEMERAL_RESPONSE });

        const sale = buildFakeSale(interaction);
        await notifyDiscord(sale, { testMode: true });

        await interaction.editReply({
            embeds: [
                brandEmbed(
                    {
                        title: "Fake Sale Sent",
                        description: "A real-style test sale notification was sent. It was not saved to the sales database.",
                    },
                    POE2WATCH_INFO_COLOR
                ),
            ],
        });
        return;
    }

    if (subcommand === "refresh-sale-metadata") {
        await interaction.deferReply({ flags: EPHEMERAL_RESPONSE });

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
