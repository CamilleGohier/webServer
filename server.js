// const http = require("http");
const WebSocket = require("ws");
const { createClient } = require("@supabase/supabase-js");

const SUPABASE_URL = "https://ulghxgjvqnymfvpoiaul.supabase.co";
const SUPABASE_KEY = "sb_publishable_GqOmftuD1b1cIvnOt60yhg_d7_jPXQ2";

const bdd = createClient(SUPABASE_URL, SUPABASE_KEY);

const PORT = process.env.PORT || 10000;
const server = new WebSocket.Server({ port: PORT });

const rooms = new Map();

console.log("Serveur WebSocket lancé sur le port ", PORT);

server.on("connection", (ws, request) => {
    const args = new URLSearchParams(request.url.split('?')[1]);
    const roomId = args.get("room");

    if (!rooms.has(roomId)) {
        rooms.set(roomId, new Set());
    }
    rooms.get(roomId).add(ws);

    ws.on("message", dataRaw => {
        const msg = JSON.parse(dataRaw);

        if (!msg.username || !msg.text) {
            return ws.send("Pseudo ou message manquant");
        }

        rooms.get(roomId).forEach(client => {
            if (client.readyState == WebSocket.OPEN) {
                client.send(msg.username + " : " + msg.text);
            }
        })
    })

    ws.on('close', () => {
        rooms.get(roomId).delete(ws);
    })
});