import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
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
    socket.firstClick = true

    socket.on('click', (data) => {
        if(socket.firstClick && socket.grid[data.row][data.col].data !== 0){
            while(socket.firstClick){
                socket.grid = createGrid()
                if(socket.grid[data.row][data.col].data === 0)socket.firstClick = false
            }
        }
        if(socket.grid[data.row][data.col].checked) return
        // console.log('Click reçu:', data, socket.grid[data.row][data.col]);
        socket.grid[data.row][data.col].checked = true
        io.emit('clickResponse', {...data, data: socket.grid[data.row][data.col].data});
    });

    socket.on('disconnect', () => {
        console.log('Un utilisateur est déconnecté');
    });
});

server.listen(8888, () => {
    console.log('Serveur démarré sur http://localhost:8888');
});


