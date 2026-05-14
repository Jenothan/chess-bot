const mongoose = require('mongoose');

/**
 * Chat Schema
 * Stores chat history for user interactions.
 */
const ChatSchema = new mongoose.Schema({
    sessionId: {
        type: String,
        required: true,
        index: true,
    },
    userMessage: {
        type: String,
        required: true,
    },
    botReply: {
        type: String,
        required: true,
    },
    timestamp: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model('Chat', ChatSchema);
