import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import * as last5 from "./last5";
import * as today from "./today";
import * as week from "./week";
import * as month from "./month";
import * as league from "./league";
import * as stats from "./stats";

export type BotCommand = {
    data: SlashCommandBuilder;
    execute: (interaction: ChatInputCommandInteraction) => Promise<void>;
};

export const commands: BotCommand[] = [
    last5,
    today,
    week,
    month,
    league,
    stats,
];

export const commandHandlers = new Map(
    commands.map((command) => [command.data.name, command.execute])
);

export const commandDefinitions = commands.map((command) => command.data.toJSON());
