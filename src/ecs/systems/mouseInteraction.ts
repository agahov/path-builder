import { Hover, Dragging, Position, Render } from '../components.js';
import { world, getDraggableEntities, getHoveredEntities, getDraggingEntities } from '../world.js';
import { addComponent, removeComponent } from 'bitecs';
import { GAME_CONFIG } from '../../config.js';
import { createLogger } from '../../logger/index.js';
import { MouseEventHandler } from '../types.js';

const logger = createLogger('mouseInteraction');

export function createMouseInteractionSystem() {
  let phase: 'hover' | 'dragging' = 'hover';
  
  // Find draggable entity at position
  function findEntityAtPosition(worldX: number, worldY: number): number | null {
    const draggableEntities = getDraggableEntities();
    const clickRadius = GAME_CONFIG.CONTROL_POINT.CLICK_RADIUS;
    
    let closestEntity: number | null = null;
    let closestDistance = clickRadius + 1;
    
    for (let i = 0; i < draggableEntities.length; i++) {
      const entity = draggableEntities[i];
      const dx = Position.x[entity] - worldX;
      const dy = Position.y[entity] - worldY;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      const entityRadius = Render.radius[entity];
      const threshold = Math.max(clickRadius, entityRadius);
      
      if (distance < threshold && distance < closestDistance) {
        closestDistance = distance;
        closestEntity = entity;
      }
    }
    
    return closestEntity;
  }
  
  /**
   * System 1: For Draggable entities - add Hover if near mouse, remove if far
   */
  function updateDraggableHover(worldX: number, worldY: number) {
    const draggableEntities = getDraggableEntities();
    const clickRadius = GAME_CONFIG.CONTROL_POINT.CLICK_RADIUS;
    
    // Find closest draggable entity within radius
    let closestEntity: number | null = null;
    let closestDistance = clickRadius + 1;
    
    for (let i = 0; i < draggableEntities.length; i++) {
      const entity = draggableEntities[i];
      const dx = Position.x[entity] - worldX;
      const dy = Position.y[entity] - worldY;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      const entityRadius = Render.radius[entity];
      const threshold = Math.max(clickRadius, entityRadius);
      
      if (distance < threshold && distance < closestDistance) {
        closestDistance = distance;
        closestEntity = entity;
      }
    }
    
    // Add Hover to closest entity if found
    if (closestEntity !== null) {
      try {
        addComponent(world, closestEntity, Hover);
        logger.debug(`Added Hover to entity ${closestEntity}`);
      } catch (e) {
        // Already has Hover component, ignore
      }
    }
  }
  
  /**
   * System 2: For Hover components - if they are far from mouse, remove Hover
   */
  function cleanupHover(worldX: number, worldY: number) {
    const hoveredEntities = getHoveredEntities();
    const clickRadius = GAME_CONFIG.CONTROL_POINT.CLICK_RADIUS;
    
    for (let i = 0; i < hoveredEntities.length; i++) {
      const entity = hoveredEntities[i];
      const dx = Position.x[entity] - worldX;
      const dy = Position.y[entity] - worldY;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      const entityRadius = Render.radius[entity];
      const threshold = Math.max(clickRadius, entityRadius);
      
      // Remove Hover if entity is too far from mouse
      if (distance >= threshold) {
        removeComponent(world, entity, Hover);
        logger.debug(`Removed Hover from entity ${entity} (distance: ${distance.toFixed(2)})`);
      }
    }
  }
  
  /**
   * Hover system - runs both cleanup and update
   */
  function runHoverSystem(worldX: number, worldY: number) {
    if (phase !== 'hover') return;
    
    cleanupHover(worldX, worldY);
    updateDraggableHover(worldX, worldY);
  }
  
  const onMouseDown: MouseEventHandler = (worldX: number, worldY: number) => {
    if (phase !== 'hover') return;
    
    const entity = findEntityAtPosition(worldX, worldY);
    
    if (entity !== null) {
      try {
        addComponent(world, entity, Dragging);
        phase = 'dragging';
        logger.info(`Started dragging entity ${entity}`);
      } catch (e) {
        // Already has Dragging component, ignore
      }
    }
  };
  
  const onMouseUp: MouseEventHandler = (worldX: number, worldY: number) => {
    if (phase !== 'dragging') return;
    
    const draggingEntities = getDraggingEntities();
    for (let i = 0; i < draggingEntities.length; i++) {
      const entity = draggingEntities[i];
      removeComponent(world, entity, Dragging);
      logger.info(`Stopped dragging entity ${entity}`);
    }
    
    phase = 'hover';
    // Immediately run hover system to restore hover state
    runHoverSystem(worldX, worldY);
  };
  
  const onMouseMove: MouseEventHandler = (worldX: number, worldY: number) => {
    runHoverSystem(worldX, worldY);
  };
  
  // Initialize in hover phase
  phase = 'hover';
  
  const getPhase = () => phase;
  
  return {
    onMouseDown,
    onMouseUp,
    onMouseMove,
    getPhase,
  };
}