import { createLogger } from '../../logger/index.js';
import { InputParams, MouseEventHandler } from '../types.js';

const logger = createLogger('mouseCapture');

export function createMouseCaptureSystem(canvas: HTMLCanvasElement, scaleX: number, scaleY: number) {
  let isActive = false;
  
  // Plain JS mouse state object
  const mouse: InputParams = {
    state: "disabled",
    screenX: 0,
    screenY: 0,
    worldX: 0,
    worldY: 0,
    isDown: 0 as 0 | 1,
  };
  
  // Event listeners storage
  const listeners = {
    mousemove: [] as MouseEventHandler[],
    mousedown: [] as MouseEventHandler[],
    mouseup: [] as MouseEventHandler[],
  };
  
  // Transform screen coordinates to world coordinates
  function screenToWorld(screenX: number, screenY: number): { x: number; y: number } {
    return {
      x: screenX / scaleX,
      y: screenY / scaleY,
    };
  }
  
  // Emit event to all listeners
  function emit(event: 'mousemove' | 'mousedown' | 'mouseup', worldX: number, worldY: number) {
    listeners[event].forEach(handler => {
      try {
        handler(worldX, worldY);
      } catch (error) {
        logger.error(`Error in ${event} handler:`, error);
      }
    });
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
    
    emit('mousemove', worldPos.x, worldPos.y);
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
    mouse.state = "dragging";
    
    emit('mousedown', worldPos.x, worldPos.y);
    
    logger.info(`Mouse down at world (${worldPos.x.toFixed(2)}, ${worldPos.y.toFixed(2)})`);
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
    mouse.state = "hover";
    
    emit('mouseup', worldPos.x, worldPos.y);
    
    logger.info(`Mouse up at world (${worldPos.x.toFixed(2)}, ${worldPos.y.toFixed(2)})`);
  };
  
  // EventEmitter-like API
  const on = (event: 'mousemove' | 'mousedown' | 'mouseup', handler: MouseEventHandler) => {
    listeners[event].push(handler);
  };
  
  const off = (event: 'mousemove' | 'mousedown' | 'mouseup', handler: MouseEventHandler) => {
    const index = listeners[event].indexOf(handler);
    if (index > -1) {
      listeners[event].splice(index, 1);
    }
  };
  
  const start = () => {
    if (isActive) return;
    
    // Initialize mouse state
    mouse.screenX = 0;
    mouse.screenY = 0;
    mouse.worldX = 0;
    mouse.worldY = 0;
    mouse.isDown = 0;
    mouse.state = "hover";
    
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
    mouse.state = "disabled";
    logger.info('Mouse capture system stopped');
  };
  
  const getMouseState = (): InputParams => mouse;
  
  return {
    start,
    stop,
    on,
    off,
    getMouseState,
    // For backward compatibility
    getInteractiveEntity: getMouseState,
    getIn: getMouseState,
  };
}