import { ChatInputCommandInteraction } from "discord.js";
import * as last5 from "./last5";
import * as today from "./today";
import * as week from "./week";
import * as month from "./month";
import * as league from "./league";
import * as stats from "./stats";
import * as top from "./top";
import * as settings from "./settings";
import * as insights from "./insights";
import * as dev from "./dev";

export type BotCommand = {
    data: {
        name: string;
        toJSON: () => unknown;
    };
    execute: (interaction: ChatInputCommandInteraction) => Promise<void>;
};

export const commands: BotCommand[] = [
    last5,
    today,
    week,
    month,
    league,
    stats,
    top,
    settings,
    insights,
    dev,
];

export const commandHandlers = new Map(
    commands.map((command) => [command.data.name, command.execute])
);

export const commandDefinitions = commands.map((command) => command.data.toJSON());
