import { Position } from '../components.js';
import { getDraggingEntities } from '../world.js';
// no logging needed here to keep hot path clean

type MouseState = {
  worldX: number;
  worldY: number;
  isDown: 0 | 1;
};

export function dragSystem(mouse: MouseState | null) {
  // Check if mouse is down and exists
  if (!mouse || mouse.isDown === 0) {
    return;
  }
  
  const draggingEntities = getDraggingEntities();
  
  if (draggingEntities.length === 0) {
    return;
  }
  
  const mouseWorldX = mouse.worldX;
  const mouseWorldY = mouse.worldY;
  
  // Update position of all dragging entities
  for (let i = 0; i < draggingEntities.length; i++) {
    const entity = draggingEntities[i];
    Position.x[entity] = mouseWorldX;
    Position.y[entity] = mouseWorldY;
  }
}

