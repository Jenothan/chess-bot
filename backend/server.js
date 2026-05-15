const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

const { trainBot } = require('./chatbot/bot');
const { db } = require('./database');

// Give SQlite a moment to initialize tables
setTimeout(async () => {
    console.log('Database initialized. training bot...');
    await trainBot();
}, 1000);

// Routes
const chatRoutes = require('./routes/chat');
app.use('/chat', chatRoutes);

// Basic Route
app.get('/', (req, res) => {
    res.send('ChessMate AI Chatbot Backend is running.');
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
