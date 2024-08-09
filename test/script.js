const canvas = document.getElementById('gridCanvas');
        const ctx = canvas.getContext('2d');

        const cellSize = 50; // Taille fixe des cellules
        let offsetX = 0;
        let offsetY = 0;
        let targetOffsetX = 0;
        let targetOffsetY = 0;
        let isDragging = false;
        let startDragX;
        let startDragY;
        let hasMoved = false; // Indique si la souris a bougé suffisamment pour être considérée comme un déplacement
        let isAnimating = false; // Indique si la grille est en cours d'animation

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
                    const color = cellColors.get(`${row},${col}`) || 'white';
                    ctx.fillStyle = color;
                    ctx.fillRect(x, y, cellSize, cellSize);
                    ctx.strokeStyle = 'black';
                    ctx.strokeRect(x, y, cellSize, cellSize);
                }
            }
        }

        function colorCell(row, col, color) {
            cellColors.set(`${row},${col}`, color);
            drawGrid();
        }

        function animate() {
            const speed = 0.1;

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

        function startDragging(event) {
            if (event.pointerType === 'mouse' && event.button === 0) { // Only handle left mouse button
                isDragging = true;
                hasMoved = false; // Réinitialiser le drapeau de mouvement
                startDragX = event.clientX;
                startDragY = event.clientY;
            }
        }

        function drag(event) {
            if (isDragging) {
                const dx = event.clientX - startDragX;
                const dy = event.clientY - startDragY;

                // Seuil de mouvement pour éviter les petits déplacements
                if (Math.abs(dx) > 10 || Math.abs(dy) > 10) { // Augmenter le seuil de mouvement à 10 pixels
                    hasMoved = true;
                }

                offsetX += dx;
                offsetY += dy;
                startDragX = event.clientX;
                startDragY = event.clientY;
                drawGrid();
            }
        }

        function stopDragging(event) {
            if (isDragging && !hasMoved) {
                // Si la souris n'a pas bougé significativement, gérer le clic
                handleClick(event);
            }
            isDragging = false;
        }

        function handleClick(event) {
            const rect = canvas.getBoundingClientRect();
            const x = event.clientX - rect.left;
            const y = event.clientY - rect.top;

            const col = Math.floor((x - offsetX) / cellSize);
            const row = Math.floor((y - offsetY) / cellSize);

            // console.log(`Clicked at: (${x}, ${y}), Grid cell: (${row}, ${col})`);

            // Mettre à jour les coordonnées de la cellule ciblée
            if (!isNearCenter(col, row)) {
                targetOffsetX = canvas.width / 2 - (col * cellSize + cellSize / 2);
                targetOffsetY = canvas.height / 2 - (row * cellSize + cellSize / 2);

                requestAnimationFrame(animate);
            }

            // Appliquer la couleur en fonction du bouton de la souris
            if (event.button === 0) { // Clic gauche
                console.log(`Coloring cell (${row}, ${col}) blue`);
                colorCell(row, col, 'lightblue');
            } else if (event.button === 2) { // Clic droit
                console.log(`Coloring cell (${row}, ${col}) red`);
                colorCell(row, col, 'red');
            }
        }

        canvas.addEventListener('pointerdown', startDragging);
        canvas.addEventListener('pointermove', drag);
        canvas.addEventListener('pointerup', stopDragging);
        canvas.addEventListener('contextmenu', event => event.preventDefault()); // Empêche le menu contextuel du clic droit

        window.addEventListener('resize', () => {
            resizeCanvas();
        });

        resizeCanvas();