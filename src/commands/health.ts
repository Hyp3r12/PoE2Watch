import { AttachmentBuilder, ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import { brandEmbed, EPHEMERAL_RESPONSE, POE2WATCH_INFO_COLOR } from "../discord/theme";
import { buildHealthExport, buildHealthFields } from "../services/health";

export const data = new SlashCommandBuilder()
    .setName("health")
    .setDescription("Show PoE2Watch setup and runtime status")
    .addSubcommand((subcommand) =>
        subcommand.setName("view").setDescription("Show private setup and runtime status")
    )
    .addSubcommand((subcommand) =>
        subcommand.setName("export").setDescription("Create a sanitized diagnostics report for support")
    );

export async function execute(interaction: ChatInputCommandInteraction) {
    const subcommand = interaction.options.getSubcommand();

    if (subcommand === "export") {
        const report = buildHealthExport();
        const attachment = new AttachmentBuilder(Buffer.from(report, "utf8"), {
            name: `poe2watch-diagnostics-${new Date().toISOString().replace(/[:.]/g, "-")}.txt`,
        });

        await interaction.reply({
            content:
                "Sanitized diagnostics export attached. Review it before posting publicly, but it does not include cookies, tokens, webhook URLs, or session IDs.",
            files: [attachment],
            allowedMentions: { parse: [] },
        });
        return;
    }

    await interaction.reply({
        embeds: [
            brandEmbed(
                {
                    title: "PoE2Watch Health",
                    description: "Local setup and watcher status. No secrets are shown.",
                    fields: buildHealthFields(),
                },
                POE2WATCH_INFO_COLOR
            ),
        ],
        flags: EPHEMERAL_RESPONSE,
    });
}
