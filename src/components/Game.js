import React, { useState, useEffect, useCallback, useRef } from 'react';
import Board from './Board';
import Score from './Score';
import { createBoard, getRandomPiece, checkCollision } from '../utils/gameHelpers';
import {
    BOARD_WIDTH_IN_BLOCKS,
    BOARD_HEIGHT_IN_BLOCKS,
    INITIAL_DROP_INTERVAL,
    PIECES,
    LINE_SCORES
} from '../utils/constants';

const Game = () => {
    const [board, setBoard] = useState(createBoard());
    const [playerPiece, setPlayerPiece] = useState(getRandomPiece());
    const [score, setScore] = useState(0);
    const [linesCleared, setLinesCleared] = useState(0);
    const [level, setLevel] = useState(1);
    const [gameState, setGameState] = useState('idle'); // 'idle', 'playing', 'gameOver'
    const [dropInterval, setDropInterval] = useState(INITIAL_DROP_INTERVAL);

    // Refs for game loop timing
    const gameLoopRef = useRef(null);
    const lastDropTimeRef = useRef(0);
    const dropCounterRef = useRef(0);

    // --- Movement --- 
    const movePlayer = useCallback((dir) => {
        if (!checkCollision(playerPiece, board, { moveX: dir, moveY: 0 })) {
            setPlayerPiece(prev => ({
                ...prev,
                pos: { ...prev.pos, x: prev.pos.x + dir }
            }));
        }
    }, [playerPiece, board]);

    const rotatePlayer = useCallback(() => {
        const currentPiece = playerPiece.matrix;
        const pieceType = playerPiece.type;
        const rotations = PIECES[pieceType].shape;
        const currentRotationIndex = playerPiece.rotationIndex;
        let nextRotationIndex = (currentRotationIndex + 1) % rotations.length;
        const nextMatrix = rotations[nextRotationIndex];

        // Create a temporary piece for collision check
        let tempPiece = JSON.parse(JSON.stringify(playerPiece)); // Deep copy
        tempPiece.matrix = nextMatrix;
        tempPiece.rotationIndex = nextRotationIndex;

        // Basic wall kick (try moving one step left/right if collision)
        let offsetX = 1;
        if (checkCollision(tempPiece, board, { moveX: 0, moveY: 0 })) {
            // Try moving right
            if (!checkCollision(tempPiece, board, { moveX: offsetX, moveY: 0 })) {
                tempPiece.pos.x += offsetX;
            } else {
                // Try moving left
                offsetX = -1;
                if (!checkCollision(tempPiece, board, { moveX: offsetX, moveY: 0 })) {
                    tempPiece.pos.x += offsetX;
                } else {
                   // Could add more complex kicks here, but for now, just don't rotate
                   return;
                }
            }
        }

        // If rotation (potentially with kick) is valid, update the piece
        setPlayerPiece(tempPiece);

    }, [playerPiece, board]);

    const dropPlayer = useCallback(() => {
        if (!checkCollision(playerPiece, board, { moveX: 0, moveY: 1 })) {
            setPlayerPiece(prev => ({
                ...prev,
                pos: { ...prev.pos, y: prev.pos.y + 1 }
            }));
            dropCounterRef.current = 0; // Reset drop counter on manual drop
        } else {
            // Landed - merge piece into board
            if (playerPiece.pos.y < 1) {
                // Game Over condition
                console.log("GAME OVER!");
                setGameState('gameOver');
                setDropInterval(null); // Stop dropping
                return; // Exit early
            }

            setBoard(prevBoard => {
                const newBoard = prevBoard.map(row => [...row]); // Create new board copy
                playerPiece.matrix.forEach((row, y) => {
                    row.forEach((value, x) => {
                        if (value !== 0) {
                            const boardY = playerPiece.pos.y + y;
                            const boardX = playerPiece.pos.x + x;
                            newBoard[boardY][boardX] = playerPiece.colorIndex;
                        }
                    });
                });

                // Check for cleared lines
                let linesRemoved = 0;
                for (let y = newBoard.length - 1; y >= 0; y--) {
                    if (newBoard[y].every(cell => cell !== 0)) {
                        linesRemoved++;
                        newBoard.splice(y, 1); // Remove the row
                    }
                }
                // Add new empty rows at the top
                for (let i = 0; i < linesRemoved; i++) {
                    newBoard.unshift(new Array(BOARD_WIDTH_IN_BLOCKS).fill(0));
                }

                // Update score and lines
                if (linesRemoved > 0) {
                    setScore(prev => prev + LINE_SCORES[linesRemoved] * level);
                    setLinesCleared(prev => prev + linesRemoved);
                }

                return newBoard;
            });

            // Get new piece
            setPlayerPiece(getRandomPiece());
            dropCounterRef.current = 0; // Reset drop counter
        }
    }, [playerPiece, board, level]);

     // --- Input Handling ---
    const handleKeyDown = useCallback(({ key }) => {
        if (gameState !== 'playing') return; // Only handle keys when playing

        switch (key) {
            case 'ArrowLeft':
            case 'a':
                movePlayer(-1);
                break;
            case 'ArrowRight':
            case 'd':
                movePlayer(1);
                break;
            case 'ArrowDown':
            case 's':
                // Accelerate drop
                lastDropTimeRef.current = performance.now(); // Reset timer to prevent immediate auto-drop
                dropPlayer();
                break;
            case 'ArrowUp':
            case 'w':
            case 'x':
                rotatePlayer();
                break;
            default:
                break;
        }
    }, [movePlayer, dropPlayer, rotatePlayer, gameState]);

    // --- Game Loop ---
    const gameLoop = useCallback((timestamp) => {
        if (gameState !== 'playing' || !dropInterval) return;

        const deltaTime = timestamp - lastDropTimeRef.current;
        lastDropTimeRef.current = timestamp;
        dropCounterRef.current += deltaTime;

        if (dropCounterRef.current > dropInterval) {
            dropPlayer();
            dropCounterRef.current = 0; // Reset counter after auto-drop
        }

        // Only request next frame if still playing
        if (gameState === 'playing') {
            gameLoopRef.current = requestAnimationFrame(gameLoop);
        }
    }, [gameState, dropInterval, dropPlayer]);

    // Effect to start game loop and handle input
    useEffect(() => {
        // Add/remove listener based on gameState
        if (gameState === 'playing') {
            document.addEventListener('keydown', handleKeyDown);
            lastDropTimeRef.current = performance.now(); // Reset timer when starting
            dropCounterRef.current = 0;
            cancelAnimationFrame(gameLoopRef.current); // Ensure no duplicate loops
            gameLoopRef.current = requestAnimationFrame(gameLoop);
        } else {
            document.removeEventListener('keydown', handleKeyDown);
            cancelAnimationFrame(gameLoopRef.current); // Stop loop if not playing
        }

        // Cleanup function
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            cancelAnimationFrame(gameLoopRef.current);
        };
    }, [gameState, handleKeyDown, gameLoop]); // Rerun when gameState or handlers change

     // Effect to increase difficulty (speed up drop interval)
    useEffect(() => {
        if (linesCleared > 0 && linesCleared % 10 === 0) {
            const newLevel = Math.floor(linesCleared / 10) + 1;
            setLevel(newLevel);
            // Speed up drop interval based on level (adjust formula as needed)
            setDropInterval(INITIAL_DROP_INTERVAL / newLevel * 0.8 + 200); // Example formula
        }
    }, [linesCleared]);

    // --- Start/Restart Logic ---
    const resetGame = () => {
        setBoard(createBoard());
        setPlayerPiece(getRandomPiece()); // Get the first piece
        setScore(0);
        setLinesCleared(0);
        setLevel(1);
        setDropInterval(INITIAL_DROP_INTERVAL);
        setGameState('idle'); // Go back to idle before starting
    };

    const startGame = () => {
        resetGame(); // Reset everything first
        setGameState('playing'); // Then set to playing to trigger effects
    };

    const restartGame = () => {
        startGame(); // Restart is the same as starting a new game
    };


    return (
        <div className="game-container">
            {gameState === 'idle' && (
                <button onClick={startGame} style={{ padding: '10px 20px', fontSize: '1.2em', cursor: 'pointer' }}>
                    Start Game
                </button>
            )}

            {gameState === 'playing' && (
                <>
                    <Score score={score} />
                    <Board board={board} playerPiece={playerPiece} />
                    <p>Level: {level}</p>
                    <p>Lines: {linesCleared}</p>
                </>
            )}

            {gameState === 'gameOver' && (
                <>
                    <div style={{color: 'red', fontSize: '2em', marginBottom: '10px'}}>GAME OVER!</div>
                    <Score score={score} /> {/* Show final score */}
                    <Board board={board} playerPiece={playerPiece} /> {/* Show final board state */}
                    <p>Level: {level}</p>
                    <p>Lines: {linesCleared}</p>
                    <button onClick={restartGame} style={{ padding: '10px 20px', fontSize: '1.2em', cursor: 'pointer', marginTop: '20px' }}>
                        Restart Game
                    </button>
                </>
            )}
        </div>
    );
};

export default Game;
