import { MouseEnter, MouseLeave, MouseDown, MouseUp, MouseIn, Position, Render, MouseInteractable } from '../components.js';
import { world, getMouseInteractableEntities, getMouseInEntities, getMouseEnteredEntities, getMouseLeaveEntities, getMouseDownEntities, getMouseUpEntities } from '../world.js';
import { addComponent, removeComponent, hasComponent, query, Not } from 'bitecs';
import { GAME_CONFIG } from '../../config.js';
import { createLogger } from '../../logger/index.js';
import { MouseEventHandler } from '../types.js';

const logger = createLogger('mouseInteraction');

export function createMouseInteractionSystem() {
  // Store current mouse position for cleanup function
  let currentMouseX = 0;
  let currentMouseY = 0;
  
  // Check if entity is under mouse position
  function isEntityUnderMouse(entity: number, worldX: number, worldY: number): boolean {
    const clickRadius = GAME_CONFIG.CONTROL_POINT.CLICK_RADIUS;
    const dx = Position.x[entity] - worldX;
    const dy = Position.y[entity] - worldY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    const entityRadius = Render.radius[entity];
    const threshold = Math.max(clickRadius, entityRadius);
    
    return distance < threshold;
  }
  
  /**
   * Update MouseEnter/MouseIn components based on mouse position
   */
  function updateMouseEnterLeave(worldX: number, worldY: number) {
    // Store current mouse position for cleanup
    currentMouseX = worldX;
    currentMouseY = worldY;
    
    // Query Interactive entities (not MouseIn)
    //const interactableEntities = getMouseInteractableEntities();
    const interactableEntities =  query(world, [MouseInteractable, Position, Render, Not(MouseIn)]);
    
    for (let i = 0; i < interactableEntities.length; i++) {
      const entity = interactableEntities[i];
      
      // Skip if already has MouseIn (already entered)
      if (hasComponent(world, entity, MouseIn)) {
        continue;
      }
      
      // Check if entity is under mouse
      if (isEntityUnderMouse(entity, worldX, worldY)) {
        try {
          addComponent(world, entity, MouseEnter);
          addComponent(world, entity, MouseIn);
          logger.debug(`Added MouseEnter and MouseIn to entity ${entity}`);
        } catch (e) {
          // Already has component, ignore
        }
      }
    }
  }
  

  
  // Find mouse-interactable entity at position (used for MouseDown/MouseUp)
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


    /**
   * Clean up one-frame event components (MouseEnter, MouseLeave, MouseDown, MouseUp)
   * and manage MouseIn state
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
  
      // Check all entities with MouseIn - if not under mouse, add MouseLeave and remove MouseIn
      const mouseInEntities = getMouseInEntities();
      for (let i = 0; i < mouseInEntities.length; i++) {
        const entity = mouseInEntities[i];
        
        // Check if entity is still under mouse
        if (!isEntityUnderMouse(entity, currentMouseX, currentMouseY)) {
          try {
            addComponent(world, entity, MouseLeave);
            removeComponent(world, entity, MouseIn);
            logger.debug(`Added MouseLeave and removed MouseIn from entity ${entity}`);
          } catch (e) {
            // Already has MouseLeave, ignore
          }
        }
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
  
  return {
    onMouseDown,
    onMouseUp,
    onMouseMove,
    update,
  };
}
