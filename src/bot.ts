import "dotenv/config";
import "./storage/database";
import { Client, GatewayIntentBits, Events } from "discord.js";
import { getLastSales } from "./storage/salesVault";

const token = process.env.DISCORD_BOT_TOKEN;

if (!token) {
    throw new Error("DISCORD_BOT_TOKEN is missing from .env");
}

const client = new Client({
    intents: [GatewayIntentBits.Guilds],
});

client.once(Events.ClientReady, (readyClient) => {
    console.log(`✅ PoE2Watch bot online as ${readyClient.user.tag}`);
});

client.on(Events.InteractionCreate, async (interaction) => {
    if (!interaction.isChatInputCommand()) return;

    if (interaction.commandName === "last5") {
        const sales = getLastSales(5) as any[];

        if (sales.length === 0) {
            await interaction.reply("No sales found yet.");
            return;
        }

        const description = sales
            .map((sale, index) => {
                return `**${index + 1}. ${sale.item_name}**\nSold for **${sale.price_amount} ${sale.price_currency}**\n${sale.sold_at}`;
            })
            .join("\n\n");

        await interaction.reply({
            embeds: [
                {
                    title: "💰 Last 5 PoE2 Sales",
                    description,
                },
            ],
        });
    }
});

client.login(token);