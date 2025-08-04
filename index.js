const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const path = require('path');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Serve static files from 'public' folder
app.use(express.static(path.join(__dirname, 'public')));

// WebSocket logic
wss.on('connection', (ws) => {
  console.log("New user connected.");
  ws.send("👋 Welcome to the WebSocket Chat!");

  ws.on('message', (message) => {
    // Broadcast to all clients except the sender
    wss.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN && client !== ws) {
        client.send(`👤 Stranger: ${message}`);
      }
    });
  });

  ws.on('close', () => {
    console.log("User disconnected.");
  });
});

const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
