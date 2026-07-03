import { ChatInputCommandInteraction, PermissionsBitField } from "discord.js";

function getDevUserIds() {
    return new Set(
        (process.env.DISCORD_DEV_USER_IDS ?? "")
            .split(",")
            .map((id) => id.trim())
            .filter(Boolean)
    );
}

export function canUseDevCommands(interaction: ChatInputCommandInteraction) {
    const devUserIds = getDevUserIds();

    if (devUserIds.has(interaction.user.id)) {
        return true;
    }

    if (!interaction.inCachedGuild()) {
        return false;
    }

    return interaction.memberPermissions.has(PermissionsBitField.Flags.Administrator);
}
