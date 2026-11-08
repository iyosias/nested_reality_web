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

  db.run(`INSERT INTO visitors (count, time)
      VALUES(${numClients}, datetime('now'))
  `);

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

const sqlite = require("sqlite3");
const db = new sqlite.Database(":memory:");

// Serialize ensures the database is setup before we run any queries
db.serialize(() => {
  db.run(`
    CREATE TABLE visitors (
      count INTEGER,
      time TEXT
    )
    `);
});

function getCounts() {
  db.each("SELECT * FROM visitors", (err, row) => {
    console.log(row);
  });
}

function shutdownDB() {
  getCounts();
  console.log("Shutting down database");
  db.close();
}
