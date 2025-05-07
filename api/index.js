const express = require('express');
const WebSocket = require('ws');
const http = require('http');
const cors = require('cors');

const app = express();
const server = http.createServer(app);

// CORS configuration
app.options('*', cors());
app.use(cors({
    origin: '*', // For development, replace with your frontend URL in production
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type']
}));

// Create WebSocket server
const wss = new WebSocket.Server({ server });

// Store all connected clients
const clients = new Set();

// Handle WebSocket connections
wss.on('connection', (ws) => {
    clients.add(ws);

    // Send immediate timestamp on new connection
    ws.send(JSON.stringify({
        subject: 'time',
        message: new Date().toISOString(),
        info: 'Welcome! Time updates will be sent every 10 seconds'
    }));

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
                message: message,
                timestamp: new Date().toISOString()
            }));
        }
    });

    res.json({ success: true });
});

// Time broadcast function
function broadcastTime() {
    const timeMessage = {
        subject: 'time',
        message: 'Server time update',
        timestamp: new Date().toISOString(),
        interval: '10 seconds'
    };

    clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(timeMessage));
        }
    });

    console.log(`Broadcasted time update at ${timeMessage.timestamp}`);
}

// Send initial time message immediately
broadcastTime();

// Set up the 10-second interval
const timeInterval = setInterval(broadcastTime, 10000);

// Clean up interval when server closes
server.on('close', () => {
    clearInterval(timeInterval);
});

// Handle both HTTP and WebSocket on the same port
module.exports = server;