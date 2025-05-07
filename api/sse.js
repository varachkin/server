// api/sse.js
const clients = new Map();
let lastTimeBroadcast = null;

export default function handler(req, res) {
    // Set SSE headers
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    const clientId = Date.now();
    clients.set(clientId, res);

    // Send immediate time update
    const initialTime = {
        subject: 'time',
        message: new Date().toISOString(),
        type: 'initial'
    };
    res.write(`data: ${JSON.stringify(initialTime)}\n\n`);

    // Send periodic updates (handled differently in serverless)
    if (!lastTimeBroadcast || Date.now() - lastTimeBroadcast > 10000) {
        broadcastTime();
    }

    req.on('close', () => {
        clients.delete(clientId);
    });
}

function broadcastTime() {
    lastTimeBroadcast = Date.now();
    const timeMessage = {
        subject: 'time',
        message: new Date().toISOString(),
        type: 'interval'
    };

    clients.forEach((res, id) => {
        res.write(`data: ${JSON.stringify(timeMessage)}\n\n`);
    });
}