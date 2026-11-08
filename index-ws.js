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

process.on("SIGINT", () => {
  console.log("SIGINT");
  wss.clients.forEach(function each(client) {
    client.close();
  });
  server.close(() => {
    shutdownDB();
  });
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

  // Better-Sqlite3 synchronous insert with parameterized query
  db.prepare(
    `
    INSERT INTO visitors (count, time)
    VALUES (?, datetime('now'))
  `,
  ).run(numClients);

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

/** End WebSockets  **/

/** Begin Database  **/

const Database = require("better-sqlite3");
const db = new Database(":memory:");

// Because better-sqlite3 is synchronous, we don't need db.serialize()
db.prepare(
  `
  CREATE TABLE visitors (
    count INTEGER,
    time TEXT
  )
`,
).run();

function getCounts() {
  const rows = db.prepare("SELECT * FROM visitors").all();
  rows.forEach((row) => {
    console.log(row);
  });
}

function shutdownDB() {
  getCounts();
  console.log("Shutting down database");
  db.close();
}
