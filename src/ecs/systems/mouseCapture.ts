// Mouse is now a plain JS object; no ECS components/entities are used here
import { GAME_CONFIG } from '../../config.js';
import { getDraggableEntities } from '../world.js';
import { Position, Render } from '../components.js';
import { createLogger } from '../../logger/index.js';
import { InputParams } from '../types.js';

const logger = createLogger('mouseCapture');

export function createMouseCaptureSystem(canvas: HTMLCanvasElement, scaleX: number, scaleY: number) {
  let isActive = false;
  // Plain JS mouse state object
  const mouse: InputParams = {
    screenX: 0,
    screenY: 0,
    worldX: 0,
    worldY: 0,
    isDown: 0 as 0 | 1,
    selected: 0,
  };
  
  // Transform screen coordinates to world coordinates
  function screenToWorld(screenX: number, screenY: number): { x: number; y: number } {
    return {
      x: screenX / scaleX,
      y: screenY / scaleY,
    };
  }
  
  // Find control point at world position (within click radius)
  function findControlPointAt(worldX: number, worldY: number): number | null {
    const draggableEntities = getDraggableEntities();
    const clickRadius = GAME_CONFIG.CONTROL_POINT.CLICK_RADIUS;
    
    let closestEntity: number | null = null;
    let closestDistance = clickRadius + 1; // Initialize beyond threshold
    
    for (let i = 0; i < draggableEntities.length; i++) {
      const entity = draggableEntities[i];
      const dx = Position.x[entity] - worldX;
      const dy = Position.y[entity] - worldY;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      // Check if within radius (considering the control point's render radius)
      const entityRadius = Render.radius[entity];
      const threshold = Math.max(clickRadius, entityRadius);
      
      if (distance < threshold && distance < closestDistance) {
        closestDistance = distance;
        closestEntity = entity;
      }
    }
    
    return closestEntity;
  }
  
  // Mouse event handlers
  const onMouseMove = (e: MouseEvent) => {
    if (!isActive) return;
    
    const rect = canvas.getBoundingClientRect();
    const screenX = e.clientX - rect.left;
    const screenY = e.clientY - rect.top;
    const worldPos = screenToWorld(screenX, screenY);
    
    mouse.screenX = screenX;
    mouse.screenY = screenY;
    mouse.worldX = worldPos.x;
    mouse.worldY = worldPos.y;
  };
  
  const onMouseDown = (e: MouseEvent) => {
    if (!isActive) return;
    
    const rect = canvas.getBoundingClientRect();
    const screenX = e.clientX - rect.left;
    const screenY = e.clientY - rect.top;
    const worldPos = screenToWorld(screenX, screenY);
    
    mouse.screenX = screenX;
    mouse.screenY = screenY;
    mouse.worldX = worldPos.x;
    mouse.worldY = worldPos.y;
    mouse.isDown = 1;
    
    // Find control point at position
    const entity = findControlPointAt(worldPos.x, worldPos.y);
    mouse.selected = entity || 0;
    
    if (entity) {
      logger.info(`Mouse down on control point ${entity} at world (${worldPos.x.toFixed(2)}, ${worldPos.y.toFixed(2)})`);
    }
  };
  
  const onMouseUp = (e: MouseEvent) => {
    if (!isActive) return;
    
    const rect = canvas.getBoundingClientRect();
    const screenX = e.clientX - rect.left;
    const screenY = e.clientY - rect.top;
    const worldPos = screenToWorld(screenX, screenY);
    
    mouse.screenX = screenX;
    mouse.screenY = screenY;
    mouse.worldX = worldPos.x;
    mouse.worldY = worldPos.y;
    mouse.isDown = 0;
    mouse.selected = 0;
    
    logger.info(`Mouse up at world (${worldPos.x.toFixed(2)}, ${worldPos.y.toFixed(2)})`);
  };
  
  const start = () => {
    if (isActive) return;
    
    // Initialize mouse state
    mouse.screenX = 0;
    mouse.screenY = 0;
    mouse.worldX = 0;
    mouse.worldY = 0;
    mouse.isDown = 0;
    mouse.selected = 0;
    
    // Subscribe to events
    canvas.addEventListener('mousemove', onMouseMove);
    canvas.addEventListener('mousedown', onMouseDown);
    canvas.addEventListener('mouseup', onMouseUp);
    
    isActive = true;
    logger.info('Mouse capture system started');
  };
  
  const stop = () => {
    if (!isActive) return;
    
    // Unsubscribe from events
    canvas.removeEventListener('mousemove', onMouseMove);
    canvas.removeEventListener('mousedown', onMouseDown);
    canvas.removeEventListener('mouseup', onMouseUp);
    
    isActive = false;
    logger.info('Mouse capture system stopped');
  };
  
  // For backward compatibility, keep the same getter name but return the JS object
  const getInteractiveEntity = (): InputParams => mouse;
  // Alias as requested: getIn returns the same mouse object
  const getIn = (): InputParams => mouse;
  
  return {
    start,
    stop,
    getInteractiveEntity,
    getIn,
  };
}

