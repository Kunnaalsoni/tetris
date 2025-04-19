import React, { useRef, useEffect } from 'react';
import {
    CANVAS_WIDTH,
    CANVAS_HEIGHT,
    BLOCK_SIZE,
    COLORS,
    BOARD_WIDTH_IN_BLOCKS,
    BOARD_HEIGHT_IN_BLOCKS
} from '../utils/constants';

const Board = ({ board, playerPiece }) => {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');

        // Scale context for block-based drawing
        context.scale(BLOCK_SIZE, BLOCK_SIZE);

        // Clear canvas
        context.fillStyle = COLORS[0]; // Background color
        context.fillRect(0, 0, BOARD_WIDTH_IN_BLOCKS, BOARD_HEIGHT_IN_BLOCKS);

        // Draw the landed pieces (board state)
        board.forEach((row, y) => {
            row.forEach((value, x) => {
                if (value !== 0) {
                    context.fillStyle = COLORS[value];
                    context.fillRect(x, y, 1, 1);
                }
            });
        });

        // Draw the current player piece
        if (playerPiece.matrix) {
            playerPiece.matrix.forEach((row, y) => {
                row.forEach((value, x) => {
                    if (value !== 0) {
                        context.fillStyle = COLORS[playerPiece.colorIndex];
                        context.fillRect(playerPiece.pos.x + x, playerPiece.pos.y + y, 1, 1);
                    }
                });
            });
        }

        // Reset scaling for next draw (important!)
        context.setTransform(1, 0, 0, 1, 0, 0);

    }, [board, playerPiece]); // Re-render when board or playerPiece changes

    return (
        <canvas
            ref={canvasRef}
            width={CANVAS_WIDTH}
            height={CANVAS_HEIGHT}
            style={{ border: '1px solid #777' }}
        />
    );
};

export default Board;
