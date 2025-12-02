const WebSocket = require("ws");
const { createClient } = require("@supabase/supabase-js");

const SUPABASE_URL = "https://ulghxgjvqnymfvpoiaul.supabase.co";
const SUPABASE_KEY = "sb_publishable_GqOmftuD1b1cIvnOt60yhg_d7_jPXQ2";

const bdd = createClient(SUPABASE_URL, SUPABASE_KEY);

const PORT = process.env.PORT || 10000;
const server = new WebSocket.Server({ port: PORT });

console.log("Serveur WebSocket lancé sur le port ", PORT);

async function inscription(username, password) {
    await bdd.from("users").insert({ username, password });
}

async function connexion(username, password) {
    return await bdd.from("users").select("*").eq("username", username).eq("password", password).single();
}


server.on("connection", ws => {
    ws.user = null;

    ws.on("message", async dataRaw => {
        const msg = dataRaw.toString();
        const args = msg.split(" ");
        const request = args[0].toUpperCase();

        if (request == "INSCRIPTION") {
            const username = args[1];
            const password = args[2];

            if (!username || !password) {
                return ws.send("Pseudo ou Mot de passe manquant");
            }

            const { error } = await inscription(username, password);

            if (error) {
                ws.send("Erreur inscription");
            }
            else {
                ws.send("Inscription OK");
            }
            return;
        }

        if (request == "CONNEXION") {
            const username = args[1];
            const password = args[2];

            if (!username || !password) {
                return ws.send("Pseudo ou Mot de passe manquant");
            }

            const { data, error } = await connexion(username, password);

            if (error || !data) {
                ws.send("Erreur connexion");
            }
            else {
                ws.user = username;
                ws.send("Connexion OK")
            }
            return;
        }

        if (!ws.user) {
            ws.send("Utilisateur pas connecté");
            return;
        }

        server.clients.forEach(client => {
            if (client.readyState == WebSocket.OPEN) {
                client.send(ws.user + " : " + msg);
            }
        })
    })
});