const express = require('express');
const cors = require('cors');
const axios = require('axios'); // For communicating with your WebSocket server

const app = express();

// CORS configuration
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type']
}));

app.use(express.json());

// POST endpoint to receive messages
app.post('/api/message', async (req, res) => {
    const { message } = req.body;

    if (!message) {
        return res.status(400).json({ error: 'Message is required' });
    }

    try {
        // Forward message to your WebSocket server
        await axios.post('YOUR_WS_SERVER_URL/api/message', { message });
        return res.json({ success: true });
    } catch (error) {
        console.error('Error forwarding message:', error);
        return res.status(500).json({ error: 'Failed to send message' });
    }
});

// Export as Vercel serverless function
module.exports = app;