import { Position, Render } from '../components.js';
import { getRenderableEntities } from '../world.js';
import { GAME_CONFIG } from '../../config.js';
import { createLogger } from '../../logger/index.js';

const logger = createLogger('render');

export function renderSystem(ctx: CanvasRenderingContext2D, scaleX: number, scaleY: number, fps: number) {
  // Clear canvas
  ctx.fillStyle = GAME_CONFIG.BACKGROUND_COLOR;
  ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  
  // Get all renderable entities
  const entities = getRenderableEntities();
  logger.info(`Render system: ${entities.length} entities found`);  
  // Draw all entities
  for (let i = 0; i < entities.length; i++) {
    const entity = entities[i];
    
    const x = Position.x[entity] * scaleX;
    const y = Position.y[entity] * scaleY;
    const radius = Render.radius[entity] * Math.min(scaleX, scaleY);
    const color = `#${Render.color[entity].toString(16).padStart(6, '0')}`;
    // logger.info(`Drawing entity ${entity} at position ${x}, ${y} with radius ${radius} and color ${color} scaleX: ${scaleX} scaleY: ${scaleY} `);
    // // Draw circle
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
  }
  
  // Draw FPS counter
  ctx.fillStyle = '#ffffff';
  ctx.font = '16px Arial';
  ctx.fillText(`FPS: ${fps.toFixed(1)}`, 10, 25);
}
