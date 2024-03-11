import { SlashCommandBuilder } from 'discord.js';
import { getLavaPlayer, getSongInfo, updateLavaPlayer } from '../../utils/index.js';

export const data = new SlashCommandBuilder()
    .setName('play')
    .setDescription('Play a song')
    .addStringOption(option =>
        option.setName('song')
            .setDescription('The song you want to play')
            .setRequired(true)
    );

export async function execute(interaction) {
    if(!interaction.member.voice.channelId) {
        return interaction.reply('You must be in a voice channel to use this command');
    }
    let playerExists = false;
    let player
    try {
        player = await getLavaPlayer(interaction.guildId, interaction.client.lavaSessionId);

        if(player.data) {
            playerExists = true;
        }
    } catch (e) {
        playerExists = false;
    }

    const payload = {
        op: 4,
        d: {
            guild_id: interaction.guildId,
            channel_id: interaction.member.voice.channelId,
            self_mute: false,
            self_deaf: true
        }
    }

    // check if the bot is already in a voice channel
    if (!playerExists) {
        interaction.client.guilds.cache.get(interaction.guildId).shard.send(payload);
    }

    if(interaction.guild.music == undefined) {
        interaction.guild.music = {
            queue: [],
            textChannel: interaction.channelId
        }
    }

    let sessionId = interaction.client.lavaSessionId;

    await interaction.deferReply('Fetching song info...');

    const { data: { data, loadType } } = await getSongInfo(interaction.options.getString('song'));

    if(loadType == 'error') {
        return interaction.followUp('Failed to load the song');
    } else if(loadType == 'empty') {
        return interaction.followUp('No songs found');
    } else if(loadType == 'search' || loadType == 'track') {
        if(!playerExists) {
            interaction.followUp(`Started playing: ${data[0].info.title} by ${data[0].info.author}`);
            await updateLavaPlayer(interaction.guildId, sessionId, data[0]);
        } else {
            interaction.followUp(`Added to queue: ${data[0].info.title} by ${data[0].info.author}`);
            interaction.guild.music.queue.push(data[0]);
        }
    } else if (loadType == 'playlist') {
        if(!playerExists) {
            interaction.followUp(`Started playing: ${data.tracks[0].info.title} by ${data.tracks[0].info.author} and ${data.tracks.length - 1} other songs`);
            interaction.guild.music.queue = interaction.guild.music.queue.concat(data.tracks.slice(1));
            await updateLavaPlayer(interaction.guildId, sessionId, data.tracks[0]);
        } else {
            interaction.followUp(`Added to queue: ${data.tracks[0].info.title} by ${data.tracks[0].info.author} and ${data.tracks.length - 1} other songs`);
            interaction.guild.music.queue = interaction.guild.music.queue.concat(data.tracks);
        }
    }
    



}
