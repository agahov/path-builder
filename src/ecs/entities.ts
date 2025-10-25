import { Position, Movement, Render } from './components.js';
import { createEntity } from './world.js';
import { GAME_CONFIG } from '../config.js';

// Generate random number between min and max
function randomBetween(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

// Generate random color as hex value
function randomColor(): number {
  const r = Math.floor(Math.random() * 256);
  const g = Math.floor(Math.random() * 256);
  const b = Math.floor(Math.random() * 256);
  return (r << 16) | (g << 8) | b;
}

// Create a single entity with random properties
export function createRandomEntity(): number {
  const entity = createEntity();
  
  // Random position within canvas bounds
  Position.x[entity] = randomBetween(0, GAME_CONFIG.CANVAS_WIDTH);
  Position.y[entity] = randomBetween(0, GAME_CONFIG.CANVAS_HEIGHT);
  
  // Random velocity
  Movement.velocityX[entity] = randomBetween(GAME_CONFIG.MIN_VELOCITY, GAME_CONFIG.MAX_VELOCITY);
  Movement.velocityY[entity] = randomBetween(GAME_CONFIG.MIN_VELOCITY, GAME_CONFIG.MAX_VELOCITY);
  
  // Random render properties
  Render.color[entity] = randomColor();
  Render.radius[entity] = randomBetween(GAME_CONFIG.MIN_RADIUS, GAME_CONFIG.MAX_RADIUS);
  
  return entity;
}

// Create multiple random entities
export function createRandomEntities(count: number = GAME_CONFIG.DEFAULT_ENTITY_COUNT): number[] {
  const entities: number[] = [];
  for (let i = 0; i < count; i++) {
    entities.push(createRandomEntity());
  }
  return entities;
}


