import { SlashCommandBuilder } from 'discord.js';
import { updateLavaPlayer, updateLavaPlayerVolume } from '../../utils/index.js';

export const data = new SlashCommandBuilder()
    .setName('volume')
    .setDescription('Change the volume of the music')
    .addIntegerOption(option => option.setName('volume').setDescription('The volume to set').setRequired(true));

export async function execute(interaction) {
    const volume = interaction.options.getInteger('volume');

    if(volume < 0 || volume > 100) {
        return interaction.reply('The volume must be between 0 and 100');
    }

    if(interaction.guild.music == undefined) {
        return interaction.reply('There is no music playing');
    }

    await updateLavaPlayerVolume(interaction.guildId, interaction.client.lavaSessionId, volume);

    await interaction.reply(`Set the volume to ${volume}`);
}