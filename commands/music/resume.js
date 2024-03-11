import { SlashCommandBuilder } from 'discord.js';
import { updateLavaPlayerPause } from '../../utils/index.js';

export const data = new SlashCommandBuilder()
    .setName('resume')
    .setDescription('Resume the music');


export async function execute(interaction) {
    if(interaction.guild.music == undefined) {
        return interaction.reply('There is no music playing');
    }

    await updateLavaPlayerPause(interaction.guildId, interaction.client.lavaSessionId, false);

    await interaction.reply('Resumed the music');
}
  