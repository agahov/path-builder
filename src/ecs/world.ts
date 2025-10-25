import { createWorld, addEntity, addComponent, query } from 'bitecs';
import { Position, Movement, Render } from './components.js';

// Create the ECS world
export const world = createWorld();

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
