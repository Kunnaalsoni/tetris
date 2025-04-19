import { BOARD_WIDTH_IN_BLOCKS, BOARD_HEIGHT_IN_BLOCKS, PIECES, PIECE_TYPES } from './constants';

// Initialize the game board representation (a 2D array)
export const createBoard = () =>
    Array.from({ length: BOARD_HEIGHT_IN_BLOCKS }, () =>
        new Array(BOARD_WIDTH_IN_BLOCKS).fill(0) // 0 represents an empty cell
    );

// Function to get a random piece
export const getRandomPiece = () => {
    const randType = PIECE_TYPES[Math.floor(Math.random() * PIECE_TYPES.length)];
    const pieceData = PIECES[randType];
    const initialRotationIndex = 0;
    const matrix = pieceData.shape[initialRotationIndex];
    return {
        matrix: matrix,
        type: randType,
        colorIndex: pieceData.colorIndex,
        rotationIndex: initialRotationIndex,
        pos: {
            x: Math.floor(BOARD_WIDTH_IN_BLOCKS / 2) - Math.floor(matrix[0].length / 2),
            y: 0
        },
        collided: false // Add a collided flag
    };
};

// Collision detection function
export const checkCollision = (playerPiece, board, { moveX = 0, moveY = 0 }) => {
    const matrix = playerPiece.matrix;
    const nextX = playerPiece.pos.x + moveX;
    const nextY = playerPiece.pos.y + moveY;

    for (let y = 0; y < matrix.length; y++) {
        for (let x = 0; x < matrix[y].length; x++) {
            // 1. Check if it's an actual cell of the piece
            if (matrix[y][x] !== 0) {
                const currentX = nextX + x;
                const currentY = nextY + y;

                // 2. Check if the move is within the board boundaries (x-axis)
                if (currentX < 0 || currentX >= BOARD_WIDTH_IN_BLOCKS) {
                    return true; // Collided with side walls
                }
                // 3. Check if the move is within the board boundaries (y-axis - bottom)
                if (currentY >= BOARD_HEIGHT_IN_BLOCKS) {
                    return true; // Collided with bottom wall
                }
                // 4. Check if the cell is not moving to an already occupied cell on the board
                // Ensure we don't check positions outside the board top (currentY < 0)
                if (currentY >= 0 && board[currentY][currentX] !== 0) {
                    return true; // Collided with another piece
                }
            }
        }
    }
    // 5. If no collision is detected after checking all cells
    return false;
};
