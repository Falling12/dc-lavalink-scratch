import { SlashCommandBuilder } from 'discord.js';

export const data = new SlashCommandBuilder()
    .setName('queue')
    .setDescription('Get the queue');

export async function execute(interaction) {
    const queue = interaction.guild.music;

    console.log(queue.queue.length);

    if(queue == undefined || queue.queue.length == 0) {
        await interaction.reply('The queue is empty!');
        return;
    }

    let queueString = "```";

    for(let i = 0; i < queue.queue.length; i++) {
        queueString += `${i + 1}. ${queue.queue[i].info.title}\n`;
    }

    queueString += "```";

    console.log(queueString.length);

    if(queueString.length > 2000) {
        // split the queue into multiple messages
        let queueArr = queueString.split('\n');
        let queueString1 = "```";
        let queueString2 = "```";

        for(let i = 0; i < queueArr.length; i++) {
            if(queueString1.length + queueArr[i].length < 2000) {
                queueString1 += queueArr[i] + '\n';
            } else {
                queueString2 += queueArr[i] + '\n';
            }
        }

        await interaction.reply(queueString1.slice(3, queueString1.length - 4) + '```');
        await interaction.followUp(queueString2 + '```');
    } else {
        await interaction.reply(queueString);
    }
}