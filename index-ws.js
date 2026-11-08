const express = require("express");
const server = require("http").createServer();
const app = express();

app.get("/", function (req, res) {
  res.sendFile("index.html", { root: __dirname });
});

server.on("request", app);
server.listen(3000, function () {
  console.log("Listening on port 3000");
});

/** BEGIN WebSocket */
const WebSocketServer = require("ws").Server;

const wss = new WebSocketServer({ server: server });

wss.on("connection", function connection(ws) {
  const numClients = wss.clients.size;
  console.log("Clients connected", numClients);

  // Send a message to all clients who are connected
  wss.broadcast(`Current visitors: ${numClients} `);

  // To the client that just connected, we can send a message
  if (ws.readyState === ws.Open) {
    ws.send("Welcome to my server");
  }

  ws.on("close", function close() {
    wss.broadcast(`Current visitors: ${numClients} `);
    console.log("A client has disconnected");
  });
});

wss.broadcast = function broadcast(data) {
  wss.clients.forEach(function each(client) {
    client.send(data);
  });
};
