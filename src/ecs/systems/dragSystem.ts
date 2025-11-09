import { Position, DragBegin, Dragging, DragEnd } from '../components.js';
import { world, getDraggableWithMouseDownEntities, getDragBeginEntities, getDraggingEntities, getDraggingWithMouseUpEntities, getDragEndEntities } from '../world.js';
import { addComponent, removeComponent } from 'bitecs';
import { createLogger } from '../../logger/index.js';

const logger = createLogger('dragSystem');

type MouseState = {
  worldX: number;
  worldY: number;
  isDown: 0 | 1;
};

export function createDragSystem() {
  /**
   * DragBegin: When entity has Draggable + MouseDown → Add DragBegin
   */
  function handleDragBegin() {
    const entities = getDraggableWithMouseDownEntities();
    
    for (let i = 0; i < entities.length; i++) {
      const entity = entities[i];
      try {
        addComponent(world, entity, DragBegin);
        logger.debug(`Added DragBegin to entity ${entity}`);
      } catch (e) {
        // Already has DragBegin, ignore
      }
    }
  }
  
  /**
   * DragBegin → Dragging: Entities with DragBegin → Add Dragging, remove DragBegin
   */
  function handleDragBeginToDragging() {
    const entities = getDragBeginEntities();
    
    for (let i = 0; i < entities.length; i++) {
      const entity = entities[i];
      try {
        addComponent(world, entity, Dragging);
        logger.info(`Started dragging entity ${entity}`);
      } catch (e) {
        // Already has Dragging, ignore
      }
      removeComponent(world, entity, DragBegin);
    }
  }
  
  /**
   * Dragging: Update position of entities with Dragging component
   */
  function handleDragging(mouse: MouseState | null) {
    if (!mouse || mouse.isDown === 0) {
      return;
    }
    
    const entities = getDraggingEntities();
    const mouseWorldX = mouse.worldX;
    const mouseWorldY = mouse.worldY;
    
    // Update position of all dragging entities
    for (let i = 0; i < entities.length; i++) {
      const entity = entities[i];
      Position.x[entity] = mouseWorldX;
      Position.y[entity] = mouseWorldY;
    }
  }
  
  /**
   * Dragging → DragEnd: When entity has Dragging + MouseUp → Remove Dragging, add DragEnd
   */
  function handleDraggingToDragEnd() {
    const entities = getDraggingWithMouseUpEntities();
    
    for (let i = 0; i < entities.length; i++) {
      const entity = entities[i];
      removeComponent(world, entity, Dragging);
      try {
        addComponent(world, entity, DragEnd);
        logger.info(`Ended dragging entity ${entity}, added DragEnd`);
      } catch (e) {
        // Already has DragEnd, ignore
      }
    }
  }
  
  /**
   * DragEnd: DragEnd component removes itself (business logic will run when DragEnd is present)
   */
  function handleDragEnd() {
    const entities = getDragEndEntities();
    
    for (let i = 0; i < entities.length; i++) {
      const entity = entities[i];
      // DragEnd removes itself - business logic can run when DragEnd is present
      // For now, we just remove it after one frame
      removeComponent(world, entity, DragEnd);
      logger.debug(`Removed DragEnd from entity ${entity}`);
    }
  }
  
  /**
   * Main update function - runs all drag system logic
   */
  const update = (mouse: MouseState | null) => {
    handleDragBegin();
    handleDragBeginToDragging();
    handleDragging(mouse);
    handleDraggingToDragEnd();
    handleDragEnd();
  };
  
  return {
    update,
  };
}
