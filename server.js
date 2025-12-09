// const http = require("http");
const WebSocket = require("ws");
// const { createClient } = require("@supabase/supabase-js");

// const SUPABASE_URL = "https://ulghxgjvqnymfvpoiaul.supabase.co";
// const SUPABASE_KEY = "sb_publishable_GqOmftuD1b1cIvnOt60yhg_d7_jPXQ2";

// const bdd = createClient(SUPABASE_URL, SUPABASE_KEY);

const PORT = process.env.PORT || 10000;
const server = new WebSocket.Server({ port: PORT });

const rooms = new Map();

console.log("Serveur WebSocket lancé sur le port ", PORT);

server.on("connection", (ws, request) => {
    const args = new URLSearchParams(request.url.split('?')[1]);
    const roomId = args.get('room');
    const username = args.get('username');

    if (!roomId || !username) {
        ws.close();
        return;
    }

    if (!rooms.has(roomId)) {
        rooms.set(roomId, new Set());
    }

    const room = rooms.get(roomId);

    const player = {
        ws: ws,
        username: username,
        score: 0
    }

    room.add(player);

    sendListPlayers(roomId);

    // rooms.get(roomId).add(ws);

    ws.on("message", dataRaw => {
        const msg = JSON.parse(dataRaw);

        room.forEach(player => {
            if (player.ws.readyState == WebSocket.OPEN) {
               player.ws.send(JSON.stringify({
                type: "msg",
                text: msg.username + " : " + msg.text
                }));
            }
        });
    });

    ws.on('close', () => {
        room.forEach(player => {
            if (player.ws == ws) {
                room.delete(player);
            }
        });

        sendListPlayers(roomId);
    });
});

function sendListPlayers(roomId) {
    const room = rooms.get(roomId);

    if (!room) {
        return;
    }

    const players = [];

    for (const player of room) {
        players.push({
            username: player.username,
            score: player.score
        }); 
    }

    room.forEach(player => {
        if (player.ws.readyState == WebSocket.OPEN) {
            player.ws.send(JSON.stringify({
                type: "players",
                players
            }));
        }
    });
}