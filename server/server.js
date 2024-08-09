const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(express.static('public'));

io.on('connection', (socket) => {
    console.log('Un utilisateur est connecté');

    socket.on('message', (data) => {
        console.log('Message reçu:', data);
        io.emit('message', data);
    });

    socket.on('disconnect', () => {
        console.log('Un utilisateur est déconnecté');
    });
});


server.listen(8888, () => {
    console.log('Serveur démarré sur http://localhost:3000');
});