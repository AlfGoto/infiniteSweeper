const socket = io('http://localhost:8888');
const canvas = document.getElementById('gridCanvas');
const ctx = canvas.getContext('2d');



socket.on('clickResponse', function (data) {
    // console.log('Server response: ' + JSON.stringify(data))
    console.log('Server response: ', data)
    
    
    // console.log(data.data)
    // return
    if (data.data === 0) {
        colorCell(data.row, data.col);
        socket.emit('click', { row: data.row - 1, col: data.col - 1 });
        socket.emit('click', { row: data.row - 1, col: data.col });
        socket.emit('click', { row: data.row - 1, col: data.col + 1 });
        socket.emit('click', { row: data.row, col: data.col - 1 });
        socket.emit('click', { row: data.row, col: data.col + 1 });
        socket.emit('click', { row: data.row + 1, col: data.col - 1 });
        socket.emit('click', { row: data.row + 1, col: data.col });
        socket.emit('click', { row: data.row + 1, col: data.col + 1 });
    }else{
        colorCell(data.row, data.col, data.data);
    }
});















const cellSize = 40;
let offsetX = 0;
let offsetY = 0;
let targetOffsetX = 0;
let targetOffsetY = 0;
let isDragging = false;
let startDragX;
let startDragY;
let startClickTime;
let isAnimating = false;

const cellColors = new Map();
const cellNumbers = new Map();

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    drawGrid();
}

function drawGrid() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const startX = Math.floor(-offsetX / cellSize);
    const startY = Math.floor(-offsetY / cellSize);
    const endX = Math.ceil((canvas.width - offsetX) / cellSize);
    const endY = Math.ceil((canvas.height - offsetY) / cellSize);

    for (let row = startY; row <= endY; row++) {
        for (let col = startX; col <= endX; col++) {
            const x = col * cellSize + offsetX;
            const y = row * cellSize + offsetY;
            const isEvenRow = row % 2 === 0;
            const isEvenCol = col % 2 === 0;
            const baseColor = isEvenRow === isEvenCol ? 'lightgreen' : 'limegreen';

            ctx.fillStyle = baseColor;
            ctx.fillRect(x, y, cellSize, cellSize);

            // Draw the color of the cell if it has been modified
            if (cellColors.has(`${row},${col}`)) {
                const cellColor = cellColors.get(`${row},${col}`);
                ctx.fillStyle = cellColor;
                ctx.fillRect(x, y, cellSize, cellSize);
            }

            if (cellNumbers.has(`${row},${col}`)) {
                ctx.fillStyle = 'black';
                ctx.font = "20px Arial";
                ctx.textAlign = "center";
                ctx.textBaseline = "middle";
                ctx.fillText(cellNumbers.get(`${row},${col}`), x + cellSize / 2, y + cellSize / 2);
            }
        }
    }
}

function colorCell(row, col, number) {
    const key = `${row},${col}`;

    let currentColor = cellColors.get(key) || getBaseColor(row, col);

    if (currentColor === 'lightgreen') {
        cellColors.set(key, 'wheat');
    } else if (currentColor === 'limegreen') {
        cellColors.set(key, 'tan');
    } else if (!cellColors.has(key)) {
        // Apply the new color only if the cell has not been colored yet
        cellColors.set(key);
    }
    if (number !== undefined) {
        cellNumbers.set(key, number);
    }
    drawGrid();
}

function getBaseColor(row, col) {
    const isEvenRow = row % 2 === 0;
    const isEvenCol = col % 2 === 0;
    return isEvenRow === isEvenCol ? 'lightgreen' : 'limegreen';
}

function animate() {
    const speed = 0.15;

    offsetX += (targetOffsetX - offsetX) * speed;
    offsetY += (targetOffsetY - offsetY) * speed;

    drawGrid();

    if (Math.abs(targetOffsetX - offsetX) > 0.5 || Math.abs(targetOffsetY - offsetY) > 0.5) {
        isAnimating = true;
        requestAnimationFrame(animate);
    } else {
        isAnimating = false;
    }
}

function isNearCenter(x, y) {
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const cellCenterX = x * cellSize + cellSize / 2 + offsetX;
    const cellCenterY = y * cellSize + cellSize / 2 + offsetY;

    const tolerance = Math.min(canvas.width, canvas.height) * 0.4 / cellSize * 50;
    return Math.abs(cellCenterX - centerX) < tolerance && Math.abs(cellCenterY - centerY) < tolerance;
}

function centerCell(row, col) {
    targetOffsetX = canvas.width / 2 - (col * cellSize + cellSize / 2);
    targetOffsetY = canvas.height / 2 - (row * cellSize + cellSize / 2);

    if (!isAnimating) {
        requestAnimationFrame(animate);
    }
}

function getClientCoordinates(event) {
    if (event.clientX !== undefined && event.clientY !== undefined) {
        return { x: event.clientX, y: event.clientY };
    } else if (event.touches && event.touches[0]) {
        return { x: event.touches[0].clientX, y: event.touches[0].clientY };
    }
    return { x: 0, y: 0 };
}

function startDragging(event) {
    if (event.pointerType === 'mouse' && event.button === 0 || event.pointerType === 'touch') {
        isDragging = true;
        startClickTime = Date.now();
        const coords = getClientCoordinates(event);
        startDragX = coords.x - offsetX;
        startDragY = coords.y - offsetY;
    }
}

function drag(event) {
    if (isDragging) {
        const coords = getClientCoordinates(event);

        // Si le clic dure plus de 200 ms, déplacer la grille
        if (Date.now() - startClickTime > 200) {
            offsetX = coords.x - startDragX;
            offsetY = coords.y - startDragY;
            drawGrid();
        }
    }
}

function stopDragging(event) {
    if (isDragging) {
        if (Date.now() - startClickTime <= 200) {
            // Si le clic est court, gérer le clic comme un clic normal
            handleClick(event);
        }
        isDragging = false;
    }
}

function handleClick(event) {
    event.preventDefault();
    const rect = canvas.getBoundingClientRect();
    const coords = getClientCoordinates(event);
    const x = coords.x - rect.left;
    const y = coords.y - rect.top;

    const col = Math.floor((x - offsetX) / cellSize);
    const row = Math.floor((y - offsetY) / cellSize);

    if (!isNearCenter(col, row)) {
        centerCell(row, col);
    }

    // Appliquer la couleur en fonction du bouton de la souris
    if (event.button === 0 || event.pointerType === 'touch') {
        socket.emit('click', { row: row, col: col });
        // colorCell(row, col); 
    } else if (event.button === 2) { // Clic droit
        // console.log(`Coloring cell (${row}, ${col}) red`);
        // colorCell(row, col, 'red');
    }
}

// Événements de souris et tactiles
canvas.addEventListener('pointerdown', startDragging);
canvas.addEventListener('pointermove', drag);
canvas.addEventListener('pointerup', stopDragging);
canvas.addEventListener('pointercancel', stopDragging);

canvas.addEventListener('touchstart', startDragging);
canvas.addEventListener('touchmove', drag);
canvas.addEventListener('touchend', stopDragging);
canvas.addEventListener('touchcancel', stopDragging);

// Empêche le menu contextuel du clic droit
canvas.addEventListener('contextmenu', event => event.preventDefault());

window.addEventListener('resize', resizeCanvas);

resizeCanvas();
