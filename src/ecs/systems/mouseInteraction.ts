import { MouseEnter, MouseLeave, MouseDown, MouseUp, Position, Render } from '../components.js';
import { world, getMouseInteractableEntities, getMouseEnteredEntities, getMouseLeaveEntities, getMouseDownEntities, getMouseUpEntities } from '../world.js';
import { addComponent, removeComponent } from 'bitecs';
import { GAME_CONFIG } from '../../config.js';
import { createLogger } from '../../logger/index.js';
import { MouseEventHandler } from '../types.js';

const logger = createLogger('mouseInteraction');

export function createMouseInteractionSystem() {
  let lastHoveredEntity: number | null = null;
  
  // Find mouse-interactable entity at position
  function findEntityAtPosition(worldX: number, worldY: number): number | null {
    const interactableEntities = getMouseInteractableEntities();
    const clickRadius = GAME_CONFIG.CONTROL_POINT.CLICK_RADIUS;
    
    let closestEntity: number | null = null;
    let closestDistance = clickRadius + 1;
    
    for (let i = 0; i < interactableEntities.length; i++) {
      const entity = interactableEntities[i];
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
   * Update MouseEnter/MouseLeave components based on mouse position
   */
  function updateMouseEnterLeave(worldX: number, worldY: number) {
    const currentEntity = findEntityAtPosition(worldX, worldY);
    
    // If mouse is over a different entity, handle enter/leave
    if (currentEntity !== lastHoveredEntity) {
      // Add MouseLeave to previous entity if it exists
      if (lastHoveredEntity !== null) {
        try {
          addComponent(world, lastHoveredEntity, MouseLeave);
          logger.debug(`Added MouseLeave to entity ${lastHoveredEntity}`);
        } catch (e) {
          // Already has MouseLeave, ignore
        }
      }
      
      // Add MouseEnter to current entity if it exists
      if (currentEntity !== null) {
        try {
          addComponent(world, currentEntity, MouseEnter);
          logger.debug(`Added MouseEnter to entity ${currentEntity}`);
        } catch (e) {
          // Already has MouseEnter, ignore
        }
      }
      
      lastHoveredEntity = currentEntity;
    }
  }
  
  /**
   * Clean up one-frame event components (MouseEnter, MouseLeave, MouseDown, MouseUp)
   */
  function cleanupEventComponents() {
    // Remove MouseEnter components
    const enteredEntities = getMouseEnteredEntities();
    for (let i = 0; i < enteredEntities.length; i++) {
      const entity = enteredEntities[i];
      removeComponent(world, entity, MouseEnter);
    }
    
    // Remove MouseLeave components
    const leaveEntities = getMouseLeaveEntities();
    for (let i = 0; i < leaveEntities.length; i++) {
      const entity = leaveEntities[i];
      removeComponent(world, entity, MouseLeave);
    }
    
    // Remove MouseDown components
    const mouseDownEntities = getMouseDownEntities();
    for (let i = 0; i < mouseDownEntities.length; i++) {
      const entity = mouseDownEntities[i];
      removeComponent(world, entity, MouseDown);
    }
    
    // Remove MouseUp components
    const mouseUpEntities = getMouseUpEntities();
    for (let i = 0; i < mouseUpEntities.length; i++) {
      const entity = mouseUpEntities[i];
      removeComponent(world, entity, MouseUp);
    }
  }
  
  const onMouseDown: MouseEventHandler = (worldX: number, worldY: number) => {
    const entity = findEntityAtPosition(worldX, worldY);
    
    if (entity !== null) {
      try {
        addComponent(world, entity, MouseDown);
        logger.info(`Added MouseDown to entity ${entity}`);
      } catch (e) {
        // Already has MouseDown, ignore
      }
    }
  };
  
  const onMouseUp: MouseEventHandler = (worldX: number, worldY: number) => {
    const entity = findEntityAtPosition(worldX, worldY);
    
    if (entity !== null) {
      try {
        addComponent(world, entity, MouseUp);
        logger.info(`Added MouseUp to entity ${entity}`);
      } catch (e) {
        // Already has MouseUp, ignore
      }
    }
  };
  
  const onMouseMove: MouseEventHandler = (worldX: number, worldY: number) => {
    updateMouseEnterLeave(worldX, worldY);
  };
  
  /**
   * Update function to be called each frame to clean up event components
   */
  const update = () => {
    cleanupEventComponents();
  };
  
  return {
    onMouseDown,
    onMouseUp,
    onMouseMove,
    update,
  };
}
