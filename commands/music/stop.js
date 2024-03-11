import { SlashCommandBuilder } from 'discord.js';
import { destroyLavaPlayer } from '../../utils/index.js';

export const data = new SlashCommandBuilder()
    .setName('stop')
    .setDescription('Stop the music');

export async function execute(interaction) {
    const payload = {
        op: 4,
        d: {
            guild_id: interaction.guildId,
            channel_id: null,
            self_mute: false,
            self_deaf: true
        }
    }

    interaction.guild.music = {
        queue: []
    }

    interaction.client.guilds.cache.get(interaction.guildId).shard.send(payload);

    await destroyLavaPlayer(interaction.guildId, interaction.client.lavaSessionId);

    await interaction.reply('Stopped the music!');
}