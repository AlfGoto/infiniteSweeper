const socket = io('http://localhost:8888');
const canvas = document.getElementById('gridCanvas');
const ctx = canvas.getContext('2d');



socket.on('clickResponse', function(data) {
    console.log('Server response: ' + JSON.stringify(data))
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
        }
    }
}

function colorCell(row, col) {
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

    const tolerance = Math.min(canvas.width, canvas.height) * 0.3 / cellSize * 50;
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
    return { x: 0, y: 0 }; // Valeurs par défaut en cas de problème
}

function startDragging(event) {
    if (event.pointerType === 'mouse' && event.button === 0 || event.pointerType === 'touch') {
        isDragging = true;
        startClickTime = Date.now(); // Enregistrez le temps de début du clic
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

    // console.log(`Clicked at: (${x}, ${y}), Grid cell: (${row}, ${col}), Button: ${event.button}`);

    // Ne recale la grille que si la cellule cliquée n'est pas proche du centre
    if (!isNearCenter(col, row)) {
        centerCell(row, col);
    }

    // Appliquer la couleur en fonction du bouton de la souris
    if (event.button === 0 || event.pointerType === 'touch') { 
        const data = { row: row, col: col };
        socket.emit('click', data);
        colorCell(row, col); 
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
