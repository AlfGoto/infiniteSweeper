const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');  // Import the CORS module

const app = express();
const server = http.createServer(app);

// Initialize Socket.IO with CORS options
const io = socketIo(server, {
    cors: {
        origin: '*', 
        methods: ['GET', 'POST'],  
    }
});

app.use(cors());
app.use(express.static('public'));

io.on('connection', (socket) => {
    console.log('Un utilisateur est connecté');

    socket.on('click', (data) => {
        console.log('Click reçu:', data);
        io.emit('clickResponse', data);
    });

    socket.on('disconnect', () => {
        console.log('Un utilisateur est déconnecté');
    });
});

// Start the server on port 8888
server.listen(8888, () => {
    console.log('Serveur démarré sur http://localhost:8888');
});
