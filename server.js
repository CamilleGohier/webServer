const http = require("http");
const WebSocket = require("ws");
const { createClient } = require("@supabase/supabase-js");

const SUPABASE_URL = "https://ulghxgjvqnymfvpoiaul.supabase.co";
const SUPABASE_KEY = "sb_publishable_GqOmftuD1b1cIvnOt60yhg_d7_jPXQ2";

const bdd = createClient(SUPABASE_URL, SUPABASE_KEY);

const PORT = process.env.PORT || 10000;
const server = new WebSocket.Server({ port: PORT });

console.log("Serveur WebSocket lancé sur le port ", PORT);

server.on("connection", ws => {

    ws.on("message", dataRaw => {
        const msg = dataRaw.toString();
        
        const [username, text] = msg.split("|");

        if (!username || !text) {
            return ws.send("Format invalide");
        }

        server.clients.forEach(client => {
            if (client.readyState == WebSocket.OPEN) {
                client.send(username + " : " + text);
            }
        })
    })
});