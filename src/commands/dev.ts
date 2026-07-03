import { ChatInputCommandInteraction, PermissionFlagsBits, SlashCommandBuilder } from "discord.js";
import { notifyDiscord } from "../discord/webhook";
import { PoeSale } from "../poe/api";
import { canUseDevCommands } from "../services/devpermissions";
import { brandEmbed, POE2WATCH_DANGER_COLOR, POE2WATCH_INFO_COLOR } from "../discord/theme";

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
    );

function buildFakeSale(interaction: ChatInputCommandInteraction): PoeSale {
    const itemName = interaction.options.getString("item") ?? "Headhunter Heavy Belt";
    const amount = interaction.options.getNumber("amount") ?? 299;
    const currency = interaction.options.getString("currency") ?? "divine";

    return {
        time: new Date().toISOString(),
        item_id: `dev-test-${Date.now()}`,
        item: {
            typeLine: itemName,
            icon: process.env.POE2WATCH_LOGO_URL || undefined,
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
    }
}
