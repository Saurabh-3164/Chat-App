

// Backend: server.js
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./Models/User');
const Message = require('./Models/Message');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const users = {};

mongoose.connect('mongodb+srv://miltcam80:KsqnLQWboHFiUDB3@cluster0.xvz6xtg.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('✅ Connected to MongoDB');

  app.post('/api/register', async (req, res) => {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'All fields are required.' });
    }
    try {
      const existing = await User.findOne({ email });
      if (existing) {
        return res.status(400).json({ error: 'Email already registered.' });
      }
      const hashedPassword = await bcrypt.hash(password, 10);
      const newUser = new User({ name, email, password: hashedPassword });
      await newUser.save();
      res.json({ message: 'Registration successful.' });
    } catch (err) {
      res.status(500).json({ error: 'Something went wrong. Try again.' });
    }
  });

  app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required.' });
    }
    try {
      const user = await User.findOne({ email });
      if (!user) return res.status(400).json({ error: 'Invalid credentials.' });

      const match = await bcrypt.compare(password, user.password);
      if (!match) return res.status(400).json({ error: 'Invalid credentials.' });

      res.json({ message: 'Login successful.', user: { name: user.name, email: user.email } });
    } catch (err) {
      res.status(500).json({ error: 'Something went wrong. Try again.' });
    }
  });

  app.post('/api/messages', async (req, res) => {
    const { from, to } = req.body;
    if (!from || !to) return res.status(400).json({ error: 'Invalid request.' });

    try {
      const messages = await Message.find({
        $or: [
          { from, to },
          { from: to, to: from }
        ]
      }).sort('timestamp');

      res.json({ messages });
    } catch (err) {
      res.status(500).json({ error: 'Error fetching messages.' });
    }
  });

  io.on('connection', (socket) => {
    console.log(`🟢 Socket connected: ${socket.id}`);

    socket.on('user_connected', (user) => {
      if (user?.email) {
        users[user.email] = { ...user, socketId: socket.id, online: true };
        io.emit('users', users);
      }
    });

    socket.on('private_message', async ({ from, to, message }) => {
      const recipient = users[to];
      const sender = users[from];

      const msgDoc = new Message({ from, to, content: message });
      await msgDoc.save();

      if (recipient && recipient.socketId) {
        io.to(recipient.socketId).emit('private_message', {
          from,
          username: sender?.name || 'Anonymous',
          message
        });
      }
    });

    socket.on('disconnect', () => {
      console.log(`🔴 Disconnected: ${socket.id}`);
      for (const email in users) {
        if (users[email].socketId === socket.id) {
          users[email].online = false;
        }
      }
      io.emit('users', users);
    });
  });

}).catch((err) => {
  console.error('❌ MongoDB connection failed:', err);
});

server.listen(3000, () => console.log('✅ Server running on http://localhost:3000'));
