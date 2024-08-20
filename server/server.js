import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { expandGrid, createGrid } from "./scripts/gridFunctions.js";
import sql from './scripts/sql.js'


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
    start(socket)

    socket.on('click', (data) => {
        let row = data.row
        let col = data.col
        // console.log('Click reçu:', data, socket.grid[row][col]);
        if (!socket.grid[row] || !socket.grid[row][col]) socket.grid = expandGrid(socket.grid, row, col)
        if (socket.grid[row][col].checked) return
        if (socket.firstClick) socket.start = Date.now()
        if (socket.firstClick && socket.grid[row][col].data !== 0) while (socket.firstClick) {
            socket.grid = createGrid()
            if (socket.grid[row][col].data === 0) socket.firstClick = false
        }
        socket.grid[row][col].checked = true
        socket.nbCases++
        if (socket.grid[row][col].data !== 'bomb') io.emit('clickResponse', { ...data, data: socket.grid[row][col].data })
        else io.emit('clickResponse', { ...data, data: socket.grid[row][col].data, nbCases: socket.nbCases, duration: Date.now() - socket.start })
    });
    socket.on('login', data => { sql.user.login(noInjection(data.username), noInjection(data.password), socket) })
    socket.on('register', data => { sql.user.register(noInjection(data.username), noInjection(data.password), socket) })

    socket.on('restart', (data) => { start(socket) })
    socket.on('disconnect', () => { console.log('Un utilisateur est déconnecté'); });
});

server.listen(8888, () => {
    console.log('Serveur démarré sur http://localhost:8888');
});


function start(socket) {
    socket.firstClick = true
    socket.nbCases = 0
    socket.start = 0
    socket.grid = createGrid()
}
function noInjection(arg) {
    arg = arg.replace('--', 'b')
    arg = arg.replace(';', 'b')
    arg = arg.replace('1=1', 'b')
    arg = arg.replace('true', 'b')
    arg = arg.replace('where', 'b')
    arg = arg.replace('WHERE', 'b')
    return arg
}