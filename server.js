const WebSocket = require("sw");
const PORT = process.env.PORT || 10000;

const server = new WebSocket.Server({ port: PORT });

server.on("connection", ws => {
    console.log("Client connecté");

    ws.on("message", message => {
        console.log("Message reçu :", message);

        server.clients.forEach(client => {
            if (client.readyState == WebSocket.OPEN) {
                client.send(String(message));
            }
        });
    });

    ws.send("Bienvenue dans le test !");
});

console.log("Serveur WebSocket lancé sur le port ", PORT);