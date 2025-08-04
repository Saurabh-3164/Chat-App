const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const path = require('path');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Serve static files (index.html, script.js, etc.)
app.use(express.static(path.join(__dirname, 'public')));

// WebSocket logic
wss.on('connection', (ws) => {
  console.log("User connected");
  ws.send("Welcome!");

  ws.on('message', (message) => {
    wss.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN && client !== ws) {
        client.send(`Stranger says: ${message}`);
      }
    });
  });

  ws.on('close', () => {
    console.log("User disconnected");
  });
});

server.listen(8080, () => {
  console.log("Server listening on http://localhost:8080");
});
