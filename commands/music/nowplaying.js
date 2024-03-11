import { SlashCommandBuilder } from 'discord.js';
import { getLavaPlayer } from '../../utils/index.js';

export const data = new SlashCommandBuilder()
    .setName('nowplaying')
    .setDescription('Get the currently playing song');

export async function execute(interaction) {
    let player

    try {
        player = await getLavaPlayer(interaction.guildId, interaction.client.lavaSessionId);
    }
    catch (e) {
        return interaction.reply('There is no song currently playing');
    }

    if(player.data == undefined) {
        return interaction.reply('There is no song currently playing');
    }

    const song = player.data.track.info

    function calculateTime(time) {
        let minutes = Math.floor(time / 60);
        let seconds = (time - minutes * 60).toFixed(0);

        // format the time to 00:00
        return `${minutes}:${seconds < 10 ? '0' + seconds : seconds}`;
    }

    console.log(song);
    let ended = false;

    interaction.client.lavaSocket.on("message", (message) => {
        const msg = JSON.parse(message);

        if(msg.guildId != interaction.guildId) return;
        if(msg.op == "playerUpdate") {
            song['position'] = msg.state.position;
        } else if(msg.op == "event") {
            if(msg.type == "TrackEndEvent") {
                ended = true;
            }
        }
    });

    let time = calculateTime(song['length'] / 1000);

    await interaction.reply(`Currently playing: ${song.title} by ${song.author} [${time}]`);

    const interval = setInterval(async () => {
        await interaction.editReply(`Currently playing: ${song.title} by ${song.author} [${calculateTime(song['position'] / 1000)} / ${time}]`);

        if(ended) {
            clearInterval(interval);
        }
    }, 1000);
}