import { movementSystem } from './ecs/systems/movement.js';
import { renderSystem } from './ecs/systems/render.js';
import { createMouseInteractionSystem } from './ecs/systems/mouseInteraction.js';
import { createDragSystem } from './ecs/systems/dragSystem.js';
import { createMouseCaptureSystem } from './ecs/systems/mouseCapture.js';
import { createPathWithControlPoints } from './ecs/entities.js';
import { GAME_CONFIG } from './config.js';
import { createLogger } from './logger/index.js';

const logger = createLogger('game');

export function createGame(canvas: HTMLCanvasElement) {
  let isRunning = false;
  let animationId = 0;
  let lastTime = 0;
  let fps = 0;
  let frameCount = 0;
  let lastFpsUpdate = 0;
  
  // Set up canvas
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Could not get 2D context from canvas');
  }
  
  // Set canvas size
  canvas.width = GAME_CONFIG.CANVAS_WIDTH;
  canvas.height = GAME_CONFIG.CANVAS_HEIGHT;
  
  // Calculate scaling factors
  const scaleX = canvas.width / GAME_CONFIG.CANVAS_WIDTH;
  const scaleY = canvas.height / GAME_CONFIG.CANVAS_HEIGHT;
  
  // Create mouse capture system
  const mouseCaptureSystem = createMouseCaptureSystem(canvas, scaleX, scaleY);
  
  // Create mouse interaction system
  const mouseInteractionSystem = createMouseInteractionSystem();
  
  // Create drag system
  const dragSystem = createDragSystem();
  
  // Register mouse event handlers
  mouseCaptureSystem.on('mousemove', mouseInteractionSystem.onMouseMove);
  mouseCaptureSystem.on('mousedown', mouseInteractionSystem.onMouseDown);
  mouseCaptureSystem.on('mouseup', mouseInteractionSystem.onMouseUp);
  
  // Create initial entities
  function createInitialEntities() {
    // Create a path with 3 control points
    const { pathEntity, controlPointEntities, pathLineEntities } = createPathWithControlPoints(3, canvas.width, canvas.height);
    logger.info(`Created path entity ${pathEntity}`);
    logger.info(`Created ${controlPointEntities.length} control points: ${controlPointEntities.join(', ')}`);
    logger.info(`Created ${pathLineEntities.length} path lines: ${pathLineEntities.join(', ')}`);
  }
  
  // Game loop
  function gameLoop(currentTime: number) {
    if (!isRunning) return;
    
    const deltaTime = (currentTime - lastTime) / 1000;
    lastTime = currentTime;
    
    // Update FPS counter
    frameCount++;
    if (currentTime - lastFpsUpdate >= GAME_CONFIG.FPS_UPDATE_INTERVAL) {
      fps = frameCount * 1000 / (currentTime - lastFpsUpdate);
      frameCount = 0;
      lastFpsUpdate = currentTime;
    }
    
    // Update game systems
    movementSystem(deltaTime);
    
    // Update drag system (runs every frame, needs MouseDown/MouseUp before cleanup)
    const mouse = mouseCaptureSystem.getMouseState();
    dragSystem.update(mouse);
    
    // Update mouse interaction system (validates MouseEnter and cleans up event components after drag system)
    mouseInteractionSystem.update();
    
    // Render
    if (ctx) {
      renderSystem(ctx, scaleX, scaleY, fps);
    }
    
    animationId = requestAnimationFrame(gameLoop);
  }
  
  // Public methods
  const start = () => {
    if (isRunning) return;
    
    logger.info('Starting game');
    isRunning = true;
    lastTime = performance.now();
    lastFpsUpdate = lastTime;
    frameCount = 0;
    
    // Start mouse capture system
    mouseCaptureSystem.start();
    
    // Create initial entities if none exist
    createInitialEntities();
    
    gameLoop(lastTime);
  };
  
  const stop = () => {
    if (!isRunning) return;
    
    logger.info('Stopping game');
    isRunning = false;
    
    // Stop mouse capture system
    mouseCaptureSystem.stop();
    
    if (animationId) {
      cancelAnimationFrame(animationId);
      animationId = 0;
    }
  };
  
  const getIsRunning = () => isRunning;
  
  return {
    start,
    stop,
    getIsRunning,
  };
}