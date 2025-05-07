const express = require('express');
const WebSocket = require('ws');
const http = require('http');

const app = express();
const server = http.createServer(app);

// Create WebSocket server
const wss = new WebSocket.Server({ server });

// Store all connected clients
const clients = new Set();

// Handle WebSocket connections
wss.on('connection', (ws) => {
    clients.add(ws);

    ws.on('close', () => {
        clients.delete(ws);
    });
});

// Middleware to parse JSON bodies
app.use(express.json());

// POST endpoint to receive messages
app.post('/api/message', (req, res) => {
    const { message } = req.body;

    if (!message) {
        return res.status(400).json({ error: 'Message is required' });
    }

    // Broadcast message to all WebSocket clients
    clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({
                subject: 'test',
                message: message
            }));
        }
    });

    res.json({ success: true });
});

// Send time updates every 10 seconds
setInterval(() => {
    const timeMessage = JSON.stringify({
        subject: 'time',
        message: new Date().toISOString()
    });

    clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(timeMessage);
        }
    });
}, 10000);

// Handle both HTTP and WebSocket on the same port
module.exports = server;