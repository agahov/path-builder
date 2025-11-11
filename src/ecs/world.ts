import { createWorld, addEntity, addComponent, removeComponent, query, removeEntity } from 'bitecs';
export { removeComponent };
import { Position, Movement, Render, Path, PathLine, PathParent, ControlPoint, Draggable, Hover, Dragging, MouseInteractable, MouseIn, MouseEnter, MouseLeave, MouseDown, MouseUp, DragBegin, DragEnd } from './components.js';

// Create the ECS world
export const world = createWorld();

// Export addComponent for use in entities.ts
export { addComponent };

// Helper function to create a basic entity with all components
export function createEntity(canvasWidth: number = 1920, canvasHeight: number = 1080) {
  const entity = addEntity(world);
  
  // Add components to the entity
  addComponent(world, entity, Position);
  addComponent(world, entity, Movement);
  addComponent(world, entity, Render);
  
  // Random position within 200px radius from screen center
  const centerX = canvasWidth / 2;
  const centerY = canvasHeight / 2;
  const angle = Math.random() * Math.PI * 2;
  const distance = Math.random() * 200;
  Position.x[entity] = centerX + Math.cos(angle) * distance;
  Position.y[entity] = centerY + Math.sin(angle) * distance;
  
  // Random velocity between 10-100
  const velocity = 10 + Math.random() * 90; // 10 to 100
  const velocityAngle = Math.random() * Math.PI * 2;
  Movement.velocityX[entity] = Math.cos(velocityAngle) * velocity;
  Movement.velocityY[entity] = Math.sin(velocityAngle) * velocity;
  
  // Random color and radius
  Render.color[entity] = Math.floor(Math.random() * 0xffffff); // Random color
  Render.radius[entity] = 5 + Math.random() * 15; // 5 to 20 radius
  
  return entity;
}

// Query functions using bitECS
export function getRenderableEntities() {
  return query(world, [Position, Render]);
}

export function getMovableEntities() {
  return query(world, [Position, Movement]);
}

export function getPathEntities() {
  return query(world, [Path]);
}

export function getControlPointEntities() {
  return query(world, [ControlPoint, PathParent]);
}

export function getPathLineEntities() {
  return query(world, [PathLine]);
}

export function getDraggableEntities() {
  return query(world, [Draggable, Position]);
}

export function getHoveredEntities() {
  return query(world, [Hover]);
}

export function getDraggingEntities() {
  return query(world, [Dragging, Position]);
}

export function getMouseInteractableEntities() {
  return query(world, [MouseInteractable, Position, Render]);
}

export function getMouseInEntities() {
  return query(world, [MouseIn]);
}

export function getMouseEnteredEntities() {
  return query(world, [MouseEnter]);
}

export function getMouseLeaveEntities() {
  return query(world, [MouseLeave]);
}

export function getMouseDownEntities() {
  return query(world, [MouseDown]);
}

export function getMouseUpEntities() {
  return query(world, [MouseUp]);
}

export function getDragBeginEntities() {
  return query(world, [DragBegin]);
}

export function getDragEndEntities() {
  return query(world, [DragEnd]);
}

export function getDraggableWithMouseDownEntities() {
  return query(world, [Draggable, MouseDown]);
}

export function getDraggingWithMouseUpEntities() {
  return query(world, [Dragging, MouseUp]);
}

/**
 * Clear all entities from the world by removing all components from each entity
 */
export function clearAllEntities() {
  // Collect all unique entity IDs by querying with different component combinations
  const entitySet = new Set<number>();
  
  // Query entities with Position (most entities have this)
  const positionEntities = query(world, [Position]);
  for (let i = 0; i < positionEntities.length; i++) {
    entitySet.add(positionEntities[i]);
  }
  
  // Query Path entities (they might not have Position)
  const pathEntities = query(world, [Path]);
  for (let i = 0; i < pathEntities.length; i++) {
    entitySet.add(pathEntities[i]);
  }
  
  // Query PathLine entities (they might not have Position)
  const pathLineEntities = query(world, [PathLine]);
  for (let i = 0; i < pathLineEntities.length; i++) {
    entitySet.add(pathLineEntities[i]);
  }
  
  // Remove all components from each entity
  const allComponents = [
    Position, Movement, Render, Path, PathLine, PathParent, ControlPoint,
    Draggable, Hover, Dragging, MouseInteractable, MouseIn, MouseEnter,
    MouseLeave, MouseDown, MouseUp, DragBegin, DragEnd
  ];
  
  for (const entity of entitySet) {
    for (const component of allComponents) {
      try {
        removeComponent(world, entity, component);
      } catch (e) {
        // Component doesn't exist on this entity, ignore
      }
    }
    // Remove the entity itself
    removeEntity(world, entity);
  }
}
