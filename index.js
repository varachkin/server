require('dotenv').config();
const express = require('express');
const { connect, StringCodec } = require('nats');

const app = express();
app.use(express.json());

let nc, sc;

// Подключение к NATS
(async () => {
    sc = StringCodec();
    nc = await connect({ servers: process.env.NATS_URL });
    console.log("Connected to NATS");
})();

app.post('/send', async (req, res) => {
    const message = req.body.message;
    if (!message) return res.status(400).json({ error: 'No message provided' });

    // Публикуем в subject
    await nc.publish('chat.messages', sc.encode(message));
    res.json({ status: 'Message sent' });
});

// Запускаем сервер
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server listening on ${PORT}`));