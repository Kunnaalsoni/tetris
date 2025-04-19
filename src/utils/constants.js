// --- Constants based on original script.js ---

export const BLOCK_SIZE = 20;
export const BOARD_WIDTH_IN_BLOCKS = 10;
export const BOARD_HEIGHT_IN_BLOCKS = 20;

export const CANVAS_WIDTH = BOARD_WIDTH_IN_BLOCKS * BLOCK_SIZE;
export const CANVAS_HEIGHT = BOARD_HEIGHT_IN_BLOCKS * BLOCK_SIZE;

// Colors for the Tetrominoes
export const COLORS = [
    '#333',     // 0 represents empty space (background color)
    '#FF0D72', // 1: T
    '#0DC2FF', // 2: O
    '#0DFF72', // 3: L
    '#F538FF', // 4: J
    '#FF8E0D', // 5: I
    '#FFE138', // 6: S
    '#3877FF', // 7: Z
];

// Tetromino Shapes (represented by numbers corresponding to COLORS array index)
export const PIECES = {
    0: { shape: [[0]], colorIndex: 0 }, // Represents empty cell
    T: {
        shape: [
            [[0, 1, 0], [1, 1, 1], [0, 0, 0]],
            [[0, 1, 0], [0, 1, 1], [0, 1, 0]],
            [[0, 0, 0], [1, 1, 1], [0, 1, 0]],
            [[0, 1, 0], [1, 1, 0], [0, 1, 0]]
        ],
        colorIndex: 1
    },
    O: {
        shape: [
            [[2, 2], [2, 2]]
        ],
        colorIndex: 2
    },
    L: {
        shape: [
            [[0, 0, 3], [3, 3, 3], [0, 0, 0]],
            [[0, 3, 0], [0, 3, 0], [0, 3, 3]],
            [[0, 0, 0], [3, 3, 3], [3, 0, 0]],
            [[3, 3, 0], [0, 3, 0], [0, 3, 0]]
        ],
        colorIndex: 3
    },
    J: {
        shape: [
            [[4, 0, 0], [4, 4, 4], [0, 0, 0]],
            [[0, 4, 4], [0, 4, 0], [0, 4, 0]],
            [[0, 0, 0], [4, 4, 4], [0, 0, 4]],
            [[0, 4, 0], [0, 4, 0], [4, 4, 0]]
        ],
        colorIndex: 4
    },
    I: {
        shape: [
            [[0, 0, 0, 0], [5, 5, 5, 5], [0, 0, 0, 0], [0, 0, 0, 0]],
            [[0, 0, 5, 0], [0, 0, 5, 0], [0, 0, 5, 0], [0, 0, 5, 0]],
            [[0, 0, 0, 0], [0, 0, 0, 0], [5, 5, 5, 5], [0, 0, 0, 0]],
            [[0, 5, 0, 0], [0, 5, 0, 0], [0, 5, 0, 0], [0, 5, 0, 0]]
        ],
        colorIndex: 5
    },
    S: {
        shape: [
            [[0, 6, 6], [6, 6, 0], [0, 0, 0]],
            [[0, 6, 0], [0, 6, 6], [0, 0, 6]],
            [[0, 0, 0], [0, 6, 6], [6, 6, 0]],
            [[6, 0, 0], [6, 6, 0], [0, 6, 0]]
        ],
        colorIndex: 6
    },
    Z: {
        shape: [
            [[7, 7, 0], [0, 7, 7], [0, 0, 0]],
            [[0, 0, 7], [0, 7, 7], [0, 7, 0]],
            [[0, 0, 0], [7, 7, 0], [0, 7, 7]],
            [[0, 7, 0], [7, 7, 0], [7, 0, 0]]
        ],
        colorIndex: 7
    }
};

export const PIECE_TYPES = 'TOLJISZ';

// Score values for line clears
export const LINE_SCORES = [0, 40, 100, 300, 1200]; // 0, 1, 2, 3, 4 lines

// Initial drop interval
export const INITIAL_DROP_INTERVAL = 1000; // ms
