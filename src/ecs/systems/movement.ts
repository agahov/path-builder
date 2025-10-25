import { Position, Movement } from '../components.js';
import { getMovableEntities } from '../world.js';
import { createLogger } from '../../logger/index.js';

const logger = createLogger('movement');

export function movementSystem(deltaTime: number) {
  const entities = getMovableEntities();
  //logger.info(`Movement system: ${entities.length} entities found`);
  
  for (let i = 0; i < entities.length; i++) {
    const entity = entities[i];
    logger.info(`Updating entity ${entity} at position ${Position.x[entity]}, ${Position.y[entity]} with velocity ${Movement.velocityX[entity]}, ${Movement.velocityY[entity]}`);
    // Update position based on velocity
    Position.x[entity] += Movement.velocityX[entity] * deltaTime;
    Position.y[entity] += Movement.velocityY[entity] * deltaTime;
  }
}