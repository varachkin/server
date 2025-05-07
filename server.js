const express = require('express');
const WebSocket = require('ws');
const http = require('http');
const cors = require('cors');

// Create Express app and HTTP server
const app = express();
const server = http.createServer(app);

// Enable CORS and JSON parsing
app.use(cors());
app.use(express.json());

// Create WebSocket server
const wss = new WebSocket.Server({ server });

// Store connected clients
const clients = new Set();

// WebSocket connection handler
wss.on('connection', (ws) => {
    console.log('New client connected');
    clients.add(ws);

    // Send welcome message
    // ws.send(JSON.stringify({
    //     side: 'server',
    //     message: 'Welcome to the server!'
    // }));

    // Handle client disconnection
    ws.on('close', () => {
        console.log('Client disconnected');
        clients.delete(ws);
    });

    // Handle errors
    ws.on('error', (error) => {
        console.error('WebSocket error:', error);
    });
});

// POST endpoint to receive messages
app.post('/api/message', (req, res) => {
    const { side, message } = req.body;

    if (!message || !side) {
        return res.status(400).json({ error: 'Both message and side are required' });
    }

    // Broadcast message to all WebSocket clients
    const messageData = { side, message };
    broadcastToClients(messageData);
    console.log(`Broadcasted message to ${side}: ${message}`);

    return res.json({ success: true });
});

// Generic broadcast function
function broadcastToClients(data) {
    clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(data));
        }
    });
}

// Start the server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`WebSocket server available at ws://localhost:${PORT}`);
    console.log(`POST messages to http://localhost:${PORT}/api/message`);
});