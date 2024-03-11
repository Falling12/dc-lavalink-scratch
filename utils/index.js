import axios from "axios";
import WebSocket from "ws";

export const getLavaVersion = async () => {
    const res = await axios.get(`http://${process.env.LAVA_HOST}:${process.env.LAVA_PORT}/version`, {
        headers: {
            Authorization: process.env.LAVA_PASSWORD
        }
    })

    return res
}

export const connectToLavaWS = async () => {
    const socket = new WebSocket(`ws://${process.env.LAVA_HOST}:${process.env.LAVA_PORT}/v4/websocket`, {
        headers: {
            Authorization: process.env.LAVA_PASSWORD,
            'User-Id': process.env.CLIENT_ID,
            'Client-Name': 'LavaClient/1.0',
        }
    })

    return socket
}

export const getSongInfo = async (query) => {
    // check if the query is a URL
    if(query.includes('https://')) {
        const res = await axios.get(`http://${process.env.LAVA_HOST}:${process.env.LAVA_PORT}/v4/loadtracks?identifier=${query}`, {
            headers: {
                Authorization: process.env.LAVA_PASSWORD
            }
        })

        return res
    }

    const res = await axios.get(`http://${process.env.LAVA_HOST}:${process.env.LAVA_PORT}/v4/loadtracks?identifier=ytsearch:${query}`, {
        headers: {
            Authorization: process.env.LAVA_PASSWORD
        }
    })

    return res
}

export const createLavaPlayer = async (guildId, sessionId, voice) => {
    const res = await axios.patch(`http://${process.env.LAVA_HOST}:${process.env.LAVA_PORT}/v4/sessions/${sessionId}/players/${guildId}?noReplace=false`, {
        position: 0,
        paused: false,
        volume: 100,
        voice: voice
    }, {
        headers: {
            Authorization: process.env.LAVA_PASSWORD
        }
    })

    return res
}

export const getLavaPlayer = async (guildId, sessionId) => {
    const res = await axios.get(`http://${process.env.LAVA_HOST}:${process.env.LAVA_PORT}/v4/sessions/${sessionId}/players/${guildId}`, {
        headers: {
            Authorization: process.env.LAVA_PASSWORD
        }
    })

    return res
}

export const destroyLavaPlayer = async (guildId, sessionId) => {
    const res = await axios.delete(`http://${process.env.LAVA_HOST}:${process.env.LAVA_PORT}/v4/sessions/${sessionId}/players/${guildId}`, {
        headers: {
            Authorization: process.env.LAVA_PASSWORD
        }
    })

    return res
}

export const updateLavaPlayer = async (guildId, sessionId, track) => {
    const res = await axios.patch(`http://${process.env.LAVA_HOST}:${process.env.LAVA_PORT}/v4/sessions/${sessionId}/players/${guildId}`, {
        track: track,
        position: 0,
        paused: false,
        volume: 100
    }, {
        headers: {
            Authorization: process.env.LAVA_PASSWORD
        }
    })

    return res
}

export const updateLavaPlayerVolume = async (guildId, sessionId, volume) => {
    const res = await axios.patch(`http://${process.env.LAVA_HOST}:${process.env.LAVA_PORT}/v4/sessions/${sessionId}/players/${guildId}`, {
        volume: volume
    }, {
        headers: {
            Authorization: process.env.LAVA_PASSWORD
        }
    })

    return res
}

export const updateLavaPlayerPause = async (guildId, sessionId, pause) => {
    const res = await axios.patch(`http://${process.env.LAVA_HOST}:${process.env.LAVA_PORT}/v4/sessions/${sessionId}/players/${guildId}`, {
        paused: pause
    }, {
        headers: {
            Authorization: process.env.LAVA_PASSWORD
        }
    })

    return res
}

export const getVoiceState = async (guildId, userId) => {
    const res = await axios.get(`https://discord.com/api/guilds/${guildId}/voice-states/${userId}`, {
        headers: {
            Authorization: `Bot ${process.env.TOKEN}`
        }
    })

    return res
}