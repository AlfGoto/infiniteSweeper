import express from 'express';
import http from 'http';
import { Server } from 'socket.io'; // Corrected import
import cors from 'cors'; 
import { createGrid } from "./gridFunctions.js";

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST'],
    }
});

app.use(cors());
app.use(express.static('public'));

io.on('connection', (socket) => {
    console.log('Un utilisateur est connecté');
    socket.grid = createGrid()

    socket.on('click', (data) => {
        console.log('Click reçu:', data);
        io.emit('clickResponse', {coords: data, square: socket.grid[data.row][data.col]});
    });

    socket.on('disconnect', () => {
        console.log('Un utilisateur est déconnecté');
    });
});

// Start the server on port 8888
server.listen(8888, () => {
    console.log('Serveur démarré sur http://localhost:8888');
});


