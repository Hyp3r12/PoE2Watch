import { ChatInputCommandInteraction } from "discord.js";
import * as last3 from "./last3";
import * as today from "./today";
import * as week from "./week";
import * as month from "./month";
import * as league from "./league";
import * as stats from "./stats";
import * as top from "./top";
import * as settings from "./settings";
import * as insights from "./insights";
import * as goal from "./goal";
import * as health from "./health";
import * as dev from "./dev";
import * as history from "./history";

export type BotCommand = {
    data: {
        name: string;
        toJSON: () => unknown;
    };
    execute: (interaction: ChatInputCommandInteraction) => Promise<void>;
};

export const commands: BotCommand[] = [
    last3,
    today,
    week,
    month,
    league,
    stats,
    top,
    settings,
    insights,
    goal,
    history,
    health,
    dev,
];

export const commandHandlers = new Map(
    commands.map((command) => [command.data.name, command.execute])
);

export const commandDefinitions = commands.map((command) => command.data.toJSON());
