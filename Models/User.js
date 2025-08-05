const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  password: { type: String, required: true },
  isOnline: { type: Boolean, default: false },
  lastSeen: { type: Date },
  friends: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  chats: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Chat' }]
});

module.exports = mongoose.model('User', userSchema);


