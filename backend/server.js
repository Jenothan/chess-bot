const express = require('express');
const mongoose = require('mongoose');
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

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/chessbot')
    .then(async () => {
        console.log('Successfully connected to MongoDB.');
        // Train bot dynamically from database
        await trainBot();
    })
    .catch((err) => console.error('MongoDB connection error:', err));

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
