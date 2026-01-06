const mongoose = require('mongoose');

const ChatLogSchema = new mongoose.Schema({
    userMessage: String, botReply: String, sentiment: String, timestamp: { type: Date, default: Date.now }
});

const ChatLog = mongoose.models.ChatLog || mongoose.model('ChatLog', ChatLogSchema);

module.exports = ChatLog;
