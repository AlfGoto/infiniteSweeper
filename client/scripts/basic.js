import socket from './socket.js'
import inGameMenu from './inGameMenu.js'
export default class basicGames {
    constructor() {
        this.canvas = document.createElement('canvas')
        document.body.appendChild(this.canvas)
        this.ctx = this.canvas.getContext('2d');
        this.cellSize = 35;
        this.menu = new inGameMenu()

        this.imgs()
        this.events()
        this.socketResponse()
        this.start()
    }
    imgs() {
        this.img = {}
        this.img.flag = new Image();
        this.img.flag.src = '/client/img/flag.png';
        this.img.flag.onload = () => { this.drawGrid() }

        this.img.bomb = new Image();
        this.img.bomb.src = '/client/img/bomb.png';
        this.img.bomb.onload = () => { this.drawGrid() }
    }
    events() {
        this.canvas.addEventListener('mousedown', e => { this.startDragging(e) });
        this.canvas.addEventListener('mousemove', e => { this.drag(e) });
        this.canvas.addEventListener('mouseup', e => { this.stopDragging(e) });
        this.canvas.addEventListener('mousecancel', e => { this.stopDragging(e) });

        this.canvas.addEventListener('touchstart', e => { this.startDragging(e) });
        this.canvas.addEventListener('touchmove', e => { this.drag(e) });
        this.canvas.addEventListener('touchend', e => { this.stopDragging(e) });
        this.canvas.addEventListener('touchcancel', e => { this.stopDragging(e) });

        this.canvas.addEventListener('contextmenu', event => event.preventDefault());

        window.addEventListener('resize', e => { this.resizeCanvas(e) });

        this.resizeCanvas();

        document.addEventListener('keydown', e => { this.keyDown(e) });
    }
    socketResponse() {
        socket.on('clickResponse', (data) => {
            // console.log(data)
            let row = data.row
            let col = data.col
            if (this.cellFlags.has(`${row},${col}`)) this.cellFlags.delete(`${row},${col}`)

            if (data.data === 0) {
                this.colorCell(row, col);
                for (let r = row - 1; r <= row + 1; r++) { for (let c = col - 1; c <= col + 1; c++) { socket.emit('click', { row: r, col: c }); } }
            } else if (data.data === 'bomb') {
                const key = `${row},${col}`;
                this.cellBombs.set(key, this.img.bomb);
                this.drawGrid();

                this.gameOver = true
                setTimeout(() => {
                    if (confirm('LOST, wanna restart ?'
                        + '\nTime played: ' + this.formatTime(data.duration)
                        + '\nCases opened: ' + data.nbCases
                        + '\n' + (data.nbCases / (data.duration / 1000)).toFixed(1) + ' Cases/seconds')) {
                        this.restart()
                    }
                }, 10)
            } else this.colorCell(row, col, data.data);
        });
    }
    start() {
        this.offsetX = 0;
        this.offsetY = 0;
        this.targetOffsetX = 0;
        this.targetOffsetY = 0;
        this.isDragging = false;
        this.startDragX;
        this.startDragY;
        this.startClickTime;
        this.isAnimating = false;
        this.gameOver = false
        this.rightClick = false
        this.leftClick = false

        this.cellColors = new Map();
        this.cellNumbers = new Map();
        this.cellFlags = new Map();
        this.cellBombs = new Map();

        this.drawGrid()
    }
    restart() {
        console.log('RESTART')
        socket.emit('restart')
        this.start()
    }
    keyDown(key) {
        if (key.key === 'PageUp') this.zoom(-10)
        if (key.key === 'PageDown') this.zoom(10)
        this.drawGrid()
    }
    zoom(arg) {
        if (this.cellSize + arg < 15 || this.cellSize + arg > 100) return
        this.cellSize += arg
        this.offsetX -= arg * 16
        this.offsetY -= arg * 16
    }
    resizeCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.drawGrid();
    }
    drawGrid() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        const startX = Math.floor(-this.offsetX / this.cellSize);
        const startY = Math.floor(-this.offsetY / this.cellSize);
        const endX = Math.ceil((this.canvas.width - this.offsetX) / this.cellSize);
        const endY = Math.ceil((this.canvas.height - this.offsetY) / this.cellSize);

        let flagInAnimation = false
        for (let row = startY; row <= endY; row++) {
            for (let col = startX; col <= endX; col++) {
                const x = col * this.cellSize + this.offsetX;
                const y = row * this.cellSize + this.offsetY;
                const isEvenRow = row % 2 === 0;
                const isEvenCol = col % 2 === 0;
                const baseColor = isEvenRow === isEvenCol ? 'lightgreen' : 'limegreen';

                this.ctx.fillStyle = baseColor;
                this.ctx.fillRect(x, y, this.cellSize, this.cellSize);

                if (this.cellColors.has(`${row},${col}`)) {
                    let decal = this.cellColors.get(`${row},${col}`).anim
                    if (decal > 1) {
                        setTimeout(() => { this.cellColors.set(`${row},${col}`, { color: this.cellColors.get(`${row},${col}`).color, anim: decal - 1 }) }, 20)
                        flagInAnimation = true
                    }
                    decal = decal - 1

                    this.ctx.fillStyle = this.cellColors.get(`${row},${col}`).color;
                    this.ctx.fillRect(x - decal, y - decal, this.cellSize + decal, this.cellSize + decal);
                }

                if (this.cellNumbers.has(`${row},${col}`)) {
                    this.ctx.fillStyle = 'black';
                    this.ctx.font = Math.floor(this.cellSize * 0.7) + "px Arial";
                    this.ctx.textAlign = "center";
                    this.ctx.textBaseline = "middle";
                    this.ctx.fillText(this.cellNumbers.get(`${row},${col}`), x + this.cellSize / 2, y + this.cellSize / 2);
                }

                if (this.cellFlags.has(`${row},${col}`)) {
                    let decal = this.cellFlags.get(`${row},${col}`)
                    if (decal > 1) {
                        setTimeout(() => { this.cellFlags.set(`${row},${col}`, decal - 1) }, 20)
                        flagInAnimation = true
                    }
                    decal = decal - 1
                    this.ctx.drawImage(this.img.flag, x, y - decal * 4, this.cellSize, this.cellSize - decal * 4);
                }

                if (this.cellBombs.has(`${row},${col}`)) {
                    this.ctx.drawImage(this.img.bomb, x, y, this.cellSize, this.cellSize);
                }
            }
        }
        if (flagInAnimation) { setTimeout(() => { this.drawGrid() }, 20) }
    }
    colorCell(row, col, number) {
        const key = `${row},${col}`;

        let currentColor = this.cellColors.get(key) || this.getBaseColor(row, col);

        if (currentColor === 'lightgreen') this.cellColors.set(key, { color: 'wheat', anim: 5 })
        else if (currentColor === 'limegreen') this.cellColors.set(key, { color: 'tan', anim: 5 });
        else if (!this.cellColors.has(key)) this.cellColors.set(key);
        if (number !== undefined) this.cellNumbers.set(key, number);
        this.drawGrid();
    }
    addFlagToCell(row, col) {
        const key = `${row},${col}`;
        if (this.cellColors.get(key)) return
        if (this.cellFlags.has(key)) this.cellFlags.delete(key);
        else this.cellFlags.set(key, 5);
        this.drawGrid();
    }
    getBaseColor(row, col) {
        const isEvenRow = row % 2 === 0;
        const isEvenCol = col % 2 === 0;
        return isEvenRow === isEvenCol ? 'lightgreen' : 'limegreen';
    }
    animate() {
        const speed = 0.15;

        this.offsetX += (this.targetOffsetX - this.offsetX) * speed;
        this.offsetY += (this.targetOffsetY - this.offsetY) * speed;

        this.drawGrid();

        if (Math.abs(this.targetOffsetX - this.offsetX) > 0.5 || Math.abs(this.targetOffsetY - this.offsetY) > 0.5) {
            this.isAnimating = true;
            requestAnimationFrame(() => this.animate());
        } else this.isAnimating = false;
    }
    isNearCenter(x, y) {
        const cellCenterX = x * this.cellSize + this.cellSize / 2 + this.offsetX;
        const cellCenterY = y * this.cellSize + this.cellSize / 2 + this.offsetY;

        const leftBoundary = this.canvas.width * 0.1;   // 10% from the left
        const rightBoundary = this.canvas.width * 0.9;  // 10% from the right
        const topBoundary = this.canvas.height * 0.1;   // 10% from the top
        const bottomBoundary = this.canvas.height * 0.9; // 10% from the bottom
        // Check if the cell center is outside the 80% central area
        return !(
            cellCenterX < leftBoundary ||
            cellCenterX > rightBoundary ||
            cellCenterY < topBoundary ||
            cellCenterY > bottomBoundary
        );
    }
    centerCell(row, col) {
        this.targetOffsetX = this.canvas.width / 2 - (col * this.cellSize + this.cellSize / 2);
        this.targetOffsetY = this.canvas.height / 2 - (row * this.cellSize + this.cellSize / 2);
        if (!this.isAnimating) requestAnimationFrame(() => this.animate());
    }
    getClientCoordinates(event) {
        if (event.clientX !== undefined && event.clientY !== undefined) return { x: event.clientX, y: event.clientY }
        else if (event.touches && event.touches[0]) return { x: event.touches[0].clientX, y: event.touches[0].clientY }
        return { x: 0, y: 0 }
    }
    startDragging(event) {
        if (this.isAnimating) return
        // console.log(`DOWN: button=${event.button}`);
        if (event.button === 0) this.leftClick = true
        if (event.button === 2) this.rightClick = true
        if (this.leftClick && this.rightClick) {
            this.handleLeftRightClick(event)
            return
        }
        if (event.button === 0 || event.pointerType === 'touch') {
            this.isDragging = true;
            this.startClickTime = Date.now();
            const coords = this.getClientCoordinates(event);
            this.startDragX = coords.x - this.offsetX;
            this.startDragY = coords.y - this.offsetY;
        }

        if (event.button === 2 && !this.leftClick) this.handleRightClick(event);
    }
    stopDragging(event) {
        setTimeout(() => {
            if (event.button === 0) this.leftClick = false
            if (event.button === 2) this.rightClick = false
        }, 10)

        if (this.isDragging) {
            if (Date.now() - this.startClickTime <= 200) { this.handleClick(event); }
            this.isDragging = false;
        }
    }
    drag(event) {
        if (this.isDragging) {
            const coords = this.getClientCoordinates(event);

            // Si le clic dure plus de 200 ms, déplacer la grille
            if (Date.now() - this.startClickTime > 200) {
                this.offsetX = coords.x - this.startDragX;
                this.offsetY = coords.y - this.startDragY;
                this.drawGrid();
            }
        }
    }
    handleClick(event) {
        event.preventDefault();
        const rect = this.canvas.getBoundingClientRect();
        const coords = this.getClientCoordinates(event);
        const x = coords.x - rect.left;
        const y = coords.y - rect.top;

        const col = Math.floor((x - this.offsetX) / this.cellSize);
        const row = Math.floor((y - this.offsetY) / this.cellSize);

        if (!this.isNearCenter(col, row)) this.centerCell(row, col);

        if (this.gameOver) return

        if (event.button === 0 || event.pointerType === 'touch') {
            if (this.cellFlags.has(`${row},${col}`)) return
            socket.emit('click', { row: row, col: col });
            // colorCell(row, col); 
        }
    }
    handleRightClick(event) {
        event.preventDefault();
        if (this.gameOver) return
        const rect = this.canvas.getBoundingClientRect();
        const coords = this.getClientCoordinates(event);
        const x = coords.x - rect.left;
        const y = coords.y - rect.top;

        const col = Math.floor((x - this.offsetX) / this.cellSize);
        const row = Math.floor((y - this.offsetY) / this.cellSize);

        this.addFlagToCell(row, col)
    }
    handleLeftRightClick(event) {
        event.preventDefault();
        if (this.gameOver) return
        const rect = this.canvas.getBoundingClientRect();
        const coords = this.getClientCoordinates(event);
        const x = coords.x - rect.left;
        const y = coords.y - rect.top;

        const col = Math.floor((x - this.offsetX) / this.cellSize);
        const row = Math.floor((y - this.offsetY) / this.cellSize);
        const key = `${row},${col}`;

        if (!this.cellColors.get(key) || !this.cellNumbers.get(key)) return

        let totalFlags = 0
        for (let r = row - 1; r <= row + 1; r++) {
            for (let c = col - 1; c <= col + 1; c++) {
                if (this.cellFlags.get(`${r},${c}`)) totalFlags++
                if (totalFlags === this.cellNumbers.get(`${row},${col}`)) {
                    for (let ro = row - 1; ro <= row + 1; ro++) {
                        for (let co = col - 1; co <= col + 1; co++) {

                            if (!this.cellColors.get(`${ro},${co}`) && !this.cellFlags.get(`${ro},${co}`)) {
                                socket.emit('click', { row: ro, col: co });
                            }
                        }
                    }
                }
            }
        }
    }
    formatTime(milli) {
        let seconds = milli / 1000;
        let hours = parseInt(seconds / 3600);
        seconds = seconds % 3600;
        let minutes = parseInt(seconds / 60);
        seconds = seconds % 60;
        // alert(hours + ":" + minutes + ":" + seconds);
        seconds = seconds.toFixed(3)
        if (minutes === 0) return seconds + 's'
        if (hours === 0) return minutes + 'min ' + seconds + 's'
        return hours + 'h' + minutes + 'min ' + seconds + 's'
    }
}