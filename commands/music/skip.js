import { SlashCommandBuilder } from 'discord.js'
import { updateLavaPlayer } from '../../utils/index.js';

export const data = new SlashCommandBuilder()
    .setName('skip')
    .setDescription('Skip the current song');

export async function execute(interaction) {
    if(interaction.guild.music.queue.length == 0) {
        return interaction.reply('There are no songs in the queue');
    }

    await updateLavaPlayer(interaction.guildId, interaction.client.lavaSessionId, interaction.guild.music.queue[0]);

    await interaction.reply(`Skipped to the next song: ${interaction.guild.music.queue[0].info.title} by ${interaction.guild.music.queue[0].info.author}`);

    interaction.guild.music.queue.shift();
}