const canvas = document.getElementById('gameCanvas');
const scoreElement = document.getElementById('score');
const context = canvas.getContext('2d');

const grid = 10; // Size of each square on the grid
const canvasWidth = canvas.width;
const canvasHeight = canvas.height;
// Adjust grid size to make Tetris blocks look better (e.g., 20x20 pixels)
// Let's redefine based on a desired block size
const blockSize = 20;
const boardWidthInBlocks = 10;
const boardHeightInBlocks = 20;
canvas.width = boardWidthInBlocks * blockSize;
canvas.height = boardHeightInBlocks * blockSize;

// Update context if canvas size changed
context.scale(blockSize, blockSize); // Scale the context for easier drawing

// Colors for the Tetrominoes
const colors = [
    null,         // 0 represents empty space
    '#FF0D72', // T
    '#0DC2FF', // O
    '#0DFF72', // L
    '#F538FF', // J
    '#FF8E0D', // I
    '#FFE138', // S
    '#3877FF', // Z
];

// Tetromino Shapes (represented by numbers corresponding to colors array)
// Each piece is an array of rotation states
// Each rotation state is a 2D array (matrix)
const pieces = {
    'T': [
        [[0, 1, 0], [1, 1, 1], [0, 0, 0]],
        [[0, 1, 0], [0, 1, 1], [0, 1, 0]],
        [[0, 0, 0], [1, 1, 1], [0, 1, 0]],
        [[0, 1, 0], [1, 1, 0], [0, 1, 0]]
    ],
    'O': [
        [[2, 2], [2, 2]]
    ],
    'L': [
        [[0, 0, 3], [3, 3, 3], [0, 0, 0]],
        [[0, 3, 0], [0, 3, 0], [0, 3, 3]],
        [[0, 0, 0], [3, 3, 3], [3, 0, 0]],
        [[3, 3, 0], [0, 3, 0], [0, 3, 0]]
    ],
    'J': [
        [[4, 0, 0], [4, 4, 4], [0, 0, 0]],
        [[0, 4, 4], [0, 4, 0], [0, 4, 0]],
        [[0, 0, 0], [4, 4, 4], [0, 0, 4]],
        [[0, 4, 0], [0, 4, 0], [4, 4, 0]]
    ],
    'I': [
        [[0, 0, 0, 0], [5, 5, 5, 5], [0, 0, 0, 0], [0, 0, 0, 0]],
        [[0, 0, 5, 0], [0, 0, 5, 0], [0, 0, 5, 0], [0, 0, 5, 0]],
        [[0, 0, 0, 0], [0, 0, 0, 0], [5, 5, 5, 5], [0, 0, 0, 0]],
        [[0, 5, 0, 0], [0, 5, 0, 0], [0, 5, 0, 0], [0, 5, 0, 0]]
    ],
    'S': [
        [[0, 6, 6], [6, 6, 0], [0, 0, 0]],
        [[0, 6, 0], [0, 6, 6], [0, 0, 6]],
        [[0, 0, 0], [0, 6, 6], [6, 6, 0]],
        [[6, 0, 0], [6, 6, 0], [0, 6, 0]]
    ],
    'Z': [
        [[7, 7, 0], [0, 7, 7], [0, 0, 0]],
        [[0, 0, 7], [0, 7, 7], [0, 7, 0]],
        [[0, 0, 0], [7, 7, 0], [0, 7, 7]],
        [[0, 7, 0], [7, 7, 0], [7, 0, 0]]
    ]
};

//--- Renamed variables for clarity based on new block size ---
const canvasHeight = canvas.height;
const boardWidth = canvasWidth / grid;
const boardHeight = canvasHeight / grid;

// Game state variables (will be expanded)
let score = 0;
let gameOver = false;

// Score values for line clears
const lineScores = [0, 40, 100, 300, 1200]; // 0, 1, 2, 3, 4 lines

// Timing for piece drop
let dropCounter = 0;
let dropInterval = 1000; // Drop every 1000ms (1 second)
let lastTime = 0;

// Game state related to the current piece
let player = {
    pos: { x: 0, y: 0 }, // Position of the top-left corner of the piece matrix
    matrix: null,       // The current rotation matrix of the piece
    pieceType: null     // e.g., 'T', 'O', 'L', etc.
};

function gameLoop(time = 0) {
    if (gameOver) {
        // Display Game Over message (to be implemented)
        console.log("Game Over!");
        return;
    }

    // Calculate time difference for drop timing
    const deltaTime = time - lastTime;
    lastTime = time;

    dropCounter += deltaTime;

    // Update piece position (move down automatically)
    if (dropCounter > dropInterval) {
        playerDrop();
    }

    // Clear the canvas
    context.clearRect(0, 0, canvasWidth, canvasHeight);

    // Draw the static (landed) blocks on the board
    drawBoard();

    // Draw the game board (to be implemented)
    drawBoard();

    // Draw the current piece
    drawPiece();

    // Request the next frame
    requestAnimationFrame(gameLoop);
}

function drawMatrix(matrix, offset) {
    matrix.forEach((row, y) => {
        row.forEach((value, x) => {
            const blockX = x + offset.x;
            const blockY = y + offset.y;
            if (value !== 0) {
                context.fillStyle = colors[value];
                // Use offset to position the piece correctly on the grid
                context.fillRect(blockX, blockY, 1, 1);

                // Add a subtle border to active pieces to match the grid
                // Removed: Border drawing is now handled by the grid on the board
            }
        });
    });
}

function drawBoard() {
    // Draw the landed pieces (non-zero values in the board array)
    // And the background color for empty cells
    board.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0) {
                context.fillStyle = colors[value];
            } else {
                context.fillStyle = '#333'; // Dark background for empty cells
            }
            context.fillRect(x, y, 1, 1); // Draw the cell color
        });
    });

    // --- Draw Grid Lines (Resetting Transform Method) ---
    context.save(); // Save the current scaled context state

    // Reset transform to draw directly in pixel coordinates
    context.resetTransform(); // Or context.setTransform(1, 0, 0, 1, 0, 0);

    context.strokeStyle = '#777'; // Use a visible grey for now
    context.lineWidth = 1; // Draw 1 physical pixel lines
    context.beginPath();

    // Vertical lines (skip edges x=0 and x=boardWidthInBlocks)
    for (let x = 1; x < boardWidthInBlocks; ++x) {
        const pixelX = x * blockSize;
        context.moveTo(pixelX, 0);
        context.lineTo(pixelX, canvas.height);
    }

    // Horizontal lines (skip edges y=0 and y=boardHeightInBlocks)
    for (let y = 1; y < boardHeightInBlocks; ++y) {
        const pixelY = y * blockSize;
        context.moveTo(0, pixelY);
        context.lineTo(canvas.width, pixelY);
    }

    context.stroke(); // Render all lines

    context.restore(); // Restore the previous scaled context state
}

function drawPiece() {
    if (player.matrix) {
        drawMatrix(player.matrix, player.pos);
    }
}

// --- Piece Manipulation and Collision ---

function playerMove(direction) {
    player.pos.x += direction;
    if (collision(player, board)) {
        // If collision, move back
        player.pos.x -= direction;
    }
}

function playerRotate() {
    const originalMatrix = player.matrix;
    const originalRotationIndex = player.rotationIndex;
    const pieceType = player.pieceType;
    const rotations = pieces[pieceType];
    let nextRotationIndex = (originalRotationIndex + 1) % rotations.length;
    player.matrix = rotations[nextRotationIndex];
    player.rotationIndex = nextRotationIndex;

    // Basic collision check after rotation (wall kick logic is more complex)
    // If it collides, revert the rotation
    if (collision(player, board)) {
        // Simple revert for now. Implementing proper wall kicks is more involved.
        player.matrix = originalMatrix;
        player.rotationIndex = originalRotationIndex;
    }
}

function playerDrop() {
    player.pos.y++;
    if (collision(player, board)) {
        // Collision detected after moving down
        player.pos.y--; // Move back up to the last valid position
        merge(player, board);
        playerReset();
        // Check and clear lines
        sweepLines();
    }
    dropCounter = 0; // Reset counter after a drop attempt
}

// Merge the player's piece into the board
function merge(player, board) {
    player.matrix.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0) {
                board[y + player.pos.y][x + player.pos.x] = value;
            }
        });
    });
}

// Collision detection function
function collision(player, board) {
    const matrix = player.matrix;
    const pos = player.pos;
    for (let y = 0; y < matrix.length; ++y) {
        for (let x = 0; x < matrix[y].length; ++x) {
            // Check if it's a block in the piece matrix
            if (matrix[y][x] !== 0) {
                // Calculate absolute position on the board
                let newY = y + pos.y;
                let newX = x + pos.x;

                // Check boundaries and collision with existing blocks
                if (newX < 0 || // Left boundary
                    newX >= boardWidthInBlocks || // Right boundary
                    newY >= boardHeightInBlocks || // Bottom boundary
                    (board[newY] && board[newY][newX] !== 0)) { // Collision with existing piece
                    return true; // Collision detected
                }
            }
        }
    }
    return false; // No collision
}

// Check for and clear completed lines
function sweepLines() {
    let linesCleared = 0;
    outer: for (let r = boardHeightInBlocks - 1; r >= 0; --r) {
        for (let c = 0; c < boardWidthInBlocks; ++c) {
            if (board[r][c] === 0) {
                continue outer; // Row is not full, move to the next row up
            }
        }

        // If we reach here, the row is full
        const removedRow = board.splice(r, 1)[0].fill(0);
        board.unshift(removedRow); // Add a new empty row at the top
        linesCleared++;

        // Since we removed a row, we need to check the same row index again
        // in the next iteration (because the rows above shifted down)
        r++;
    }

    if (linesCleared > 0) {
        score += lineScores[linesCleared] * (1); // Add level multiplier later if needed
        updateScore();
    }
}

// --- Initial Setup ---

// Initialize the game board representation (e.g., a 2D array)
const board = [];
// Use the block-based dimensions
for (let r = 0; r < boardHeightInBlocks; r++) {
    board[r] = [];
    for (let c = 0; c < boardWidthInBlocks; c++) {
        board[r][c] = 0; // 0 represents an empty cell
    }
}

// Function to get a random piece
function getRandomPiece() {
    const pieceTypes = 'TOLJISZ';
    const randType = pieceTypes[Math.floor(Math.random() * pieceTypes.length)];
    const matrix = pieces[randType][0]; // Start with the first rotation
    return {
        matrix: matrix,
        type: randType,
        rotationIndex: 0 // Keep track of current rotation
    };
}

// Initialize the player's first piece
function playerReset() {
    const newPiece = getRandomPiece();
    player.matrix = newPiece.matrix;
    player.pieceType = newPiece.type;
    player.rotationIndex = newPiece.rotationIndex;
    // Position the piece at the top-center
    player.pos.y = 0;
    player.pos.x = Math.floor(boardWidthInBlocks / 2) - Math.floor(player.matrix[0].length / 2);

    // Game over condition: if the new piece immediately collides
    if (collision(player, board)) {
        gameOver = true;
        console.log("Game Over - Initial Spawn Collision");
    }
}

// Update score display
function updateScore() {
    scoreElement.innerText = 'Score: ' + score;
}

// Add event listeners for controls (to be implemented)
document.addEventListener('keydown', event => {
    // console.log(event.key); // Useful for debugging key codes
    switch (event.key) {
        case 'ArrowLeft':
        case 'a': // Optional WASD support
            playerMove(-1);
            event.preventDefault(); // Prevent browser scrolling
            break;
        case 'ArrowRight':
        case 'd': // Optional WASD support
            playerMove(1);
            event.preventDefault();
            break;
        case 'ArrowDown':
        case 's': // Optional WASD support
            playerDrop();
            // Optional: Add points for manual drop
            event.preventDefault();
            break;
        case 'ArrowUp': // Commonly used for rotation
        case 'w':
        case 'x': // Another common rotation key
            playerRotate();
            event.preventDefault();
            break;
        // Add keys for other rotations (e.g., 'z' for counter-clockwise) if desired
    }
});

// --- Touch Controls ---
let touchStartX = 0;
let touchStartY = 0;
let lastTouchX = 0; // Track last position during move
let lastTouchY = 0;
let touchEndX = 0; // Track end position for gesture calculation
let touchEndY = 0;
let isDragging = false; // Flag to differentiate tap from drag

const swipeThreshold = 30; // Minimum distance in pixels to be considered a swipe
const tapThreshold = 10;   // Maximum distance for a tap
const tapTimeThreshold = 250; // Maximum time in ms for a tap
let touchStartTime = 0;

canvas.addEventListener('touchstart', event => {
    // Prevent page scroll - important for gameplay on touch devices
    event.preventDefault();
    if (event.touches.length > 1) return; // Ignore multi-touch
    touchStartX = event.changedTouches[0].screenX;
    touchStartY = event.changedTouches[0].screenY;
    lastTouchX = touchStartX;
    lastTouchY = touchStartY;
    touchStartTime = new Date().getTime();
    isDragging = false; // Reset dragging state on new touch
}, { passive: false }); // Need passive: false to be able to call preventDefault

canvas.addEventListener('touchmove', event => {
    event.preventDefault();
    if (event.touches.length > 1) return;

    const currentTouchX = event.changedTouches[0].screenX;
    const currentTouchY = event.changedTouches[0].screenY;

    const deltaX = currentTouchX - lastTouchX;
    const deltaY = currentTouchY - lastTouchY;

    const horizontalMoveThreshold = blockSize * 0.5; // Move if dragged half a block width
    //const verticalMoveThreshold = blockSize * 0.8;   // Be less sensitive to vertical drag for dropping

    // Horizontal Dragging
    if (Math.abs(deltaX) > horizontalMoveThreshold) {
        playerMove(deltaX > 0 ? 1 : -1);
        lastTouchX = currentTouchX; // Update last position after a move
        // Adjust lastTouchY as well to prevent accidental vertical moves if primarily horizontal
        lastTouchY = currentTouchY;
        isDragging = true;
    }

    // Vertical dragging for drop is intentionally omitted here;
    // swipe down in touchend provides a more explicit control.

}, { passive: false });

canvas.addEventListener('touchend', event => {
    event.preventDefault(); // Prevent potential double actions (like zoom)
    if (event.touches.length > 0) return; // Only handle the final touchend
    touchEndX = event.changedTouches[0].screenX;
    touchEndY = event.changedTouches[0].screenY;
    handleGesture();
}, { passive: false });

function handleGesture() {
    const deltaX = touchEndX - touchStartX;
    const deltaY = touchEndY - touchStartY;
    const totalElapsedTime = new Date().getTime() - touchStartTime;

    // Check for tap: if not dragging, minimal movement, short duration
    if (!isDragging &&
        Math.abs(deltaX) < tapThreshold &&
        Math.abs(deltaY) < tapThreshold &&
        totalElapsedTime < tapTimeThreshold) {
        playerRotate(); // Tap to rotate
        return;
    }

    // Check for Swipe Down (only if not primarily a drag/tap)
    // Check if vertical movement is dominant and exceeds threshold
    // This is only checked if we weren't dragging horizontally
    if (!isDragging && Math.abs(deltaY) > Math.abs(deltaX) && deltaY > swipeThreshold) {
        if (deltaY > 0) { // Swipe down
            playerDrop();
        }
        // Swipe up is ignored
    }
    // Horizontal swipes are now handled by touchmove (dragging)
}

// Reset player piece
playerReset();

// Initial score display
updateScore();

// Start the game loop
requestAnimationFrame(gameLoop);

