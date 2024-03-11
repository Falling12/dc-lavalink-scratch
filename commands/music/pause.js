import { SlashCommandBuilder } from 'discord.js';
import { updateLavaPlayerPause } from '../../utils/index.js';

export const data = new SlashCommandBuilder()
    .setName('pause')
    .setDescription('Pause the music');


export async function execute(interaction) {
    if(interaction.guild.music == undefined) {
        return interaction.reply('There is no music playing');
    }

    await updateLavaPlayerPause(interaction.guildId, interaction.client.lavaSessionId, true);

    await interaction.reply('Paused the music');
}
  