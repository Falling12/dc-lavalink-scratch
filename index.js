import { Client, Collection, Events, GatewayIntentBits, REST, Routes } from "discord.js";
import dotenv from "dotenv";
import fs from "fs";
import { connectToLavaWS, createLavaPlayer, destroyLavaPlayer, updateLavaPlayer } from "./utils/index.js";

dotenv.config();

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildVoiceStates
    ]
});

client.commands = new Collection();

// Add the commands to the client.commands Collection using es6 modules
const folders = fs.readdirSync("./commands");

for (const folder of folders) {
    const commandFiles = fs.readdirSync(`./commands/${folder}`).filter(file => file.endsWith(".js"));

    for (const file of commandFiles) {
        const { data, execute } = await import(`./commands/${folder}/${file}`);

        client.commands.set(data.name, { data, execute });
    }
}

const rest = new REST().setToken(process.env.TOKEN);

(async () => {
    try {
        console.log("Started refreshing application (/) commands.");

        console.log(client.commands.map(command => command.execute))

        await rest.put(
            Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.TEST_GUILD),
            { body: client.commands.map(command => command.data.toJSON()) }
        );

        console.log("Successfully reloaded application (/) commands.");
    } catch (error) {
        console.error(error);
    }
})()

const socket = await connectToLavaWS();
const vcsData = {}

socket.on("message", async (msg) => {
    const message = JSON.parse(msg);

    if(message.op == "ready") {
        client.lavaSessionId = message.sessionId;
        console.log("Lava ready!", client.lavaSessionId);
    }

    // If the message is a track end event
    if(message.op == "event" && message.type == "TrackEndEvent") {
        if(message.reason !== "finished") return
        // If the queue is empty
        if(client.guilds.cache.get(message.guildId).music.queue.length == 0) {
            // Destroy the player
            await destroyLavaPlayer(message.guildId, client.lavaSessionId);
            // start a countdown from 5 seconds to disconnect the bot from the voice channel and send a message including the current remaining time
            let time = 5;
            await client.guilds.cache.get(message.guildId).channels.cache.get(client.guilds.cache.get(message.guildId).music.textChannel).send(`Disconnecting in ${time} seconds`);

            await client.guilds.cache.get(message.guildId).shard.send({
                op: 4,
                d: {
                    guild_id: message.guildId,
                    channel_id: null,
                    self_mute: false,
                    self_deaf: true
                }
            });
        } else {
            await updateLavaPlayer(message.guildId, client.lavaSessionId, client.guilds.cache.get(message.guildId).music.queue[0]);
            await client.guilds.cache.get(message.guildId).channels.cache.get(client.guilds.cache.get(message.guildId).music.textChannel).send(`Started playing: ${client.guilds.cache.get(message.guildId).music.queue[0].info.title} by ${client.guilds.cache.get(message.guildId).music.queue[0].info.author}`);
            await client.guilds.cache.get(message.guildId).music.queue.shift();
        }
    }
})

client.lavaSocket = socket;

client.on("raw", async data => {
    switch(data.t) {
        case "VOICE_SERVER_UPDATE":
            if(!vcsData[data.d.guild_id]) return

            await createLavaPlayer(data.d.guild_id, client.lavaSessionId, {
                token: data.d.token,
                endpoint: data.d.endpoint,
                sessionId: vcsData[data.d.guild_id].sessionId
            })

            vcsData[data.d.guild_id].server = {
                token: data.d.token,
                endpoint: data.d.endpoint
            }

            break

        case "VOICE_STATE_UPDATE":
            if (data.d.member.user.id !== process.env.CLIENT_ID) return;

            vcsData[data.d.guild_id] = {
                ...vcsData[data.d.guild_id],
                sessionId: data.d.session_id
            }

            if(vcsData[data.d.guild_id].server) {
                await createLavaPlayer(data.d.guild_id, client.lavaSessionId, {
                    token: vcsData[data.d.guild_id].server.token,
                    endpoint: vcsData[data.d.guild_id].server.endpoint,
                    sessionId: vcsData[data.d.guild_id].sessionId
                })
            }

            break
    }
})

client.on("ready", () => {
    console.log("Bot is ready!");
})

client.on("interactionCreate", async interaction => {
    if (!interaction.isCommand()) return;

    try {
        await client.commands.get(interaction.commandName).execute(interaction);
    } catch (error) {
        console.error(error);
        await interaction.reply({ content: "There was an error while executing this command!", ephemeral: true });
    }
});

client.login(process.env.TOKEN)