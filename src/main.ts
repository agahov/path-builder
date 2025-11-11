import './style.css';
import { createGame } from './game.js';

// Get the canvas element
const canvas = document.getElementById('gameCanvas') as HTMLCanvasElement;

if (!canvas) {
  throw new Error('Canvas element not found');
}

// Create and start the game
const game = createGame(canvas);
game.start();

// Handle page visibility changes to pause/resume game
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    game.pause();
  } else {
    game.resume();
  }
});
