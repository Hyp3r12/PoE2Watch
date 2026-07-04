import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import {
    brandEmbed,
    EPHEMERAL_RESPONSE,
    POE2WATCH_DANGER_COLOR,
    POE2WATCH_GOAL_COLOR,
    POE2WATCH_INFO_COLOR,
} from "../discord/theme";
import { addGoal, clearGoals, completeGoal, getGoals, removeGoal, reorderGoal } from "../storage/goals";
import { buildGoalsDescription } from "../services/goals";
import { normalizeCurrency } from "../services/valueformatter";

const GOAL_CURRENCIES = ["divine", "exalted", "chaos"] as const;

function normalizeGoalCurrency(currency: string) {
    const normalized = normalizeCurrency(currency);

    return GOAL_CURRENCIES.includes(normalized as (typeof GOAL_CURRENCIES)[number]) ? normalized : null;
}

function goalsEmbed(title = "Trading Goals") {
    return brandEmbed(
        {
            title,
            description: buildGoalsDescription(getGoals()),
        },
        POE2WATCH_GOAL_COLOR
    );
}

export const data = new SlashCommandBuilder()
    .setName("goal")
    .setDescription("Manage prioritized trading goals")
    .addSubcommand((subcommand) =>
        subcommand
            .setName("add")
            .setDescription("Add a trading goal")
            .addStringOption((option) =>
                option
                    .setName("name")
                    .setDescription("Goal name, like Mageblood or Build Upgrade")
                    .setRequired(true)
            )
            .addNumberOption((option) =>
                option
                    .setName("amount")
                    .setDescription("Target amount")
                    .setMinValue(0.01)
                    .setRequired(true)
            )
            .addStringOption((option) =>
                option
                    .setName("currency")
                    .setDescription("Target currency")
                    .setRequired(true)
                    .addChoices(
                        { name: "Divine", value: "divine" },
                        { name: "Exalted", value: "exalted" },
                        { name: "Chaos", value: "chaos" }
                    )
            )
            .addIntegerOption((option) =>
                option
                    .setName("priority")
                    .setDescription("Optional priority. 1 gets funded first.")
                    .setMinValue(1)
            )
    )
    .addSubcommand((subcommand) => subcommand.setName("list").setDescription("List prioritized trading goals"))
    .addSubcommand((subcommand) => subcommand.setName("view").setDescription("View prioritized trading goals"))
    .addSubcommand((subcommand) =>
        subcommand
            .setName("remove")
            .setDescription("Remove a goal without marking it achieved")
            .addIntegerOption((option) =>
                option
                    .setName("priority")
                    .setDescription("Goal priority number to remove")
                    .setMinValue(1)
                    .setRequired(true)
            )
    )
    .addSubcommand((subcommand) =>
        subcommand
            .setName("complete")
            .setDescription("Mark a goal achieved and remove it from active goals")
            .addIntegerOption((option) =>
                option
                    .setName("priority")
                    .setDescription("Goal priority number to mark achieved")
                    .setMinValue(1)
                    .setRequired(true)
            )
    )
    .addSubcommand((subcommand) =>
        subcommand
            .setName("reorder")
            .setDescription("Change a goal priority")
            .addIntegerOption((option) =>
                option
                    .setName("priority")
                    .setDescription("Current goal priority number")
                    .setMinValue(1)
                    .setRequired(true)
            )
            .addIntegerOption((option) =>
                option
                    .setName("new-priority")
                    .setDescription("New priority. 1 gets funded first.")
                    .setMinValue(1)
                    .setRequired(true)
            )
    )
    .addSubcommand((subcommand) => subcommand.setName("clear-all").setDescription("Clear all trading goals"));

export async function execute(interaction: ChatInputCommandInteraction) {
    const subcommand = interaction.options.getSubcommand();

    if (subcommand === "add") {
        const name = interaction.options.getString("name", true);
        const amount = interaction.options.getNumber("amount", true);
        const currency = normalizeGoalCurrency(interaction.options.getString("currency", true));
        const priority = interaction.options.getInteger("priority") ?? undefined;

        if (!currency) {
            await interaction.reply({
                embeds: [
                    brandEmbed(
                        {
                            title: "Goal Not Added",
                            description: "Use Divine, Exalted, or Chaos for goal currency.",
                        },
                        POE2WATCH_DANGER_COLOR
                    ),
                ],
                flags: EPHEMERAL_RESPONSE,
            });
            return;
        }

        addGoal(name, amount, currency, priority);

        await interaction.reply({
            embeds: [goalsEmbed("Goal Added")],
        });
        return;
    }

    if (subcommand === "list" || subcommand === "view") {
        await interaction.reply({
            embeds: [goalsEmbed()],
        });
        return;
    }

    if (subcommand === "remove") {
        const priority = interaction.options.getInteger("priority", true);
        const removed = removeGoal(priority);

        await interaction.reply({
            embeds: [
                removed
                    ? goalsEmbed("Goal Removed")
                    : brandEmbed(
                          {
                              title: "Goal Not Found",
                              description: `No goal at priority **${priority}** was found.`,
                          },
                          POE2WATCH_DANGER_COLOR
                      ),
            ],
            ...(removed ? {} : { flags: EPHEMERAL_RESPONSE }),
        });
        return;
    }

    if (subcommand === "complete") {
        const priority = interaction.options.getInteger("priority", true);
        const completed = completeGoal(priority);

        await interaction.reply({
            embeds: [
                completed
                    ? goalsEmbed(`${completed.name} Achieved`)
                    : brandEmbed(
                          {
                              title: "Goal Not Found",
                              description: `No goal at priority **${priority}** was found.`,
                          },
                          POE2WATCH_DANGER_COLOR
                      ),
            ],
            ...(completed ? {} : { flags: EPHEMERAL_RESPONSE }),
        });
        return;
    }

    if (subcommand === "reorder") {
        const priority = interaction.options.getInteger("priority", true);
        const newPriority = interaction.options.getInteger("new-priority", true);
        const reordered = reorderGoal(priority, newPriority);

        await interaction.reply({
            embeds: [
                reordered
                    ? goalsEmbed("Goal Reordered")
                    : brandEmbed(
                          {
                              title: "Goal Not Found",
                              description: `No goal at priority **${priority}** was found.`,
                          },
                          POE2WATCH_DANGER_COLOR
                      ),
            ],
            ...(reordered ? {} : { flags: EPHEMERAL_RESPONSE }),
        });
        return;
    }

    if (subcommand === "clear-all") {
        clearGoals();

        await interaction.reply({
            embeds: [
                brandEmbed(
                    {
                        title: "Goals Cleared",
                        description: "All trading goals were removed.",
                    },
                    POE2WATCH_INFO_COLOR
                ),
            ],
            flags: EPHEMERAL_RESPONSE,
        });
    }
}
