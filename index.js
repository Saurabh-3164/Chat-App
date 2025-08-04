const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static(path.join(__dirname, 'public')));

const users = {};

io.on('connection', (socket) => {
  console.log(`🟢 New connection: ${socket.id}`);

  socket.on('register', (username) => {
    users[socket.id] = username;
    io.emit('users', users);
  });

  socket.on('private_message', ({ to, message }) => {
    io.to(to).emit('private_message', {
      from: socket.id,
      username: users[socket.id],
      message
    });
  });

  socket.on('disconnect', () => {
    console.log(`🔴 Disconnected: ${socket.id}`);
    delete users[socket.id];
    io.emit('users', users);
  });
});

server.listen(3000, () => {
  console.log('✅ Server running on http://localhost:3000');
});
