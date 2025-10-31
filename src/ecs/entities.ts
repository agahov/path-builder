import { Position, Movement, Render, Path, PathLine, PathParent, ControlPoint, Draggable } from './components.js';
import { createEntity, world, addComponent } from './world.js';
import { addEntity } from 'bitecs';
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

// Create a path entity with style properties
export function createPathEntity(): number {
  const entity = addEntity(world);
  
  addComponent(world, entity, Path);
  
  Path.firstPathLine[entity] = 0; // Will be set when PathLines are added
  Path.lineWidth[entity] = GAME_CONFIG.PATH.DEFAULT_LINE_WIDTH;
  Path.lineColor[entity] = GAME_CONFIG.PATH.DEFAULT_LINE_COLOR;
  Path.smoothness[entity] = GAME_CONFIG.PATH.DEFAULT_SMOOTHNESS;
  
  return entity;
}

// Create a control point entity
export function createControlPointEntity(
  x: number,
  y: number,
  pathEntityId: number
): number {
  const entity = addEntity(world);
  
  addComponent(world, entity, Position);
  addComponent(world, entity, Render);
  addComponent(world, entity, ControlPoint);
  addComponent(world, entity, PathParent);
  addComponent(world, entity, Draggable);
  
  // Set position (scaled to game coordinates)
  Position.x[entity] = x;
  Position.y[entity] = y;
  
  // Set render properties
  Render.color[entity] = GAME_CONFIG.PATH.CONTROL_POINT_COLOR;
  Render.radius[entity] = GAME_CONFIG.PATH.CONTROL_POINT_RADIUS;
  
  // Set control point marker
  ControlPoint.isControlPoint[entity] = 1;
  
  // Set parent path reference
  PathParent.pathEntityId[entity] = pathEntityId;
  
  return entity;
}

// Create a PathLine entity
export function createPathLineEntity(startControlPoint: number, nextPathLine: number): number {
  const entity = addEntity(world);
  
  addComponent(world, entity, PathLine);
  
  PathLine.startControlPoint[entity] = startControlPoint;
  PathLine.nextPathLine[entity] = nextPathLine;
  
  return entity;
}

// Create a path with N control points in a closed loop
export function createPathWithControlPoints(
  controlPointCount: number,
  canvasWidth: number = GAME_CONFIG.CANVAS_WIDTH,
  canvasHeight: number = GAME_CONFIG.CANVAS_HEIGHT
) {
  const centerX = canvasWidth / 2;
  const centerY = canvasHeight / 2;
  
  // Create path entity
  const pathEntity = createPathEntity();
  
  // Create control points in random positions around center
  const controlPointEntities: number[] = [];
  for (let i = 0; i < controlPointCount; i++) {
    const angle = (i / controlPointCount) * Math.PI * 2;
    const distance = 100 + Math.random() * 150; // 100-250px from center
    const noiseX = (Math.random() - 0.5) * 50; // ±25px noise
    const noiseY = (Math.random() - 0.5) * 50;
    
    const x = centerX + Math.cos(angle) * distance + noiseX;
    const y = centerY + Math.sin(angle) * distance + noiseY;
    
    const cpEntity = createControlPointEntity(x, y, pathEntity);
    controlPointEntities.push(cpEntity);
  }
  
  // Create PathLine entities forming closed loop
  const pathLineIds: number[] = [];
  
  for (let i = 0; i < controlPointCount; i++) {
    const nextPathLineId = i === controlPointCount - 1 
      ? pathLineIds[0]  // Close the loop
      : 0; // Will be set below
    
    const pathLineId = createPathLineEntity(
      controlPointEntities[i],
      nextPathLineId
    );
    pathLineIds.push(pathLineId);
  }
  
  // Update nextPathLine references to form the loop
  for (let i = 0; i < controlPointCount; i++) {
    const nextIndex = (i + 1) % controlPointCount;
    PathLine.nextPathLine[pathLineIds[i]] = pathLineIds[nextIndex];
  }
  
  // Set first PathLine in Path component
  Path.firstPathLine[pathEntity] = pathLineIds[0];
  
  return {
    pathEntity,
    controlPointEntities,
    pathLineEntities: pathLineIds,
  };
}

