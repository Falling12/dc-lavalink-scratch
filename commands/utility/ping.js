import { SlashCommandBuilder } from 'discord.js';

export const data = new SlashCommandBuilder()
    .setName('ping')
    .setDescription('test');

export async function execute(interaction) {
    await interaction.reply('Pong!');
}