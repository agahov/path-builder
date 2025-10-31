import { Hover, Dragging } from '../components.js';
import { world, getDraggableEntities, getHoveredEntities, getDraggingEntities } from '../world.js';
import { addComponent, removeComponent } from 'bitecs';
import { GAME_CONFIG } from '../../config.js';
import { Position, Render } from '../components.js';
import { createLogger } from '../../logger/index.js';
import { InputParams } from '../types.js';

const logger = createLogger('mouseInteraction');

export function mouseInteractionSystem(mouse: InputParams | null) {
  // Check if mouse state exists and is initialized
  if (!mouse) return;
  
  const mouseWorldX = mouse.worldX;
  const mouseWorldY = mouse.worldY;
  const mouseIsDown = mouse.isDown;
  const mouseSelected = mouse.selected;
  
  const draggableEntities = getDraggableEntities();
  const hoveredEntities = getHoveredEntities();
  const draggingEntities = getDraggingEntities();
  
  // Handle hover detection on mouse move (only when not dragging)
  if (!mouseIsDown) {
    // Remove Hover component from all previously hovered entities
    for (let i = 0; i < hoveredEntities.length; i++) {
      const entity = hoveredEntities[i];
      removeComponent(world, entity, Hover);
    }
    
    // Find control point under mouse cursor
    const clickRadius = GAME_CONFIG.CONTROL_POINT.CLICK_RADIUS;
    let hoveredEntity: number | null = null;
    let closestDistance = clickRadius + 1;
    
    for (let i = 0; i < draggableEntities.length; i++) {
      const entity = draggableEntities[i];
      const dx = Position.x[entity] - mouseWorldX;
      const dy = Position.y[entity] - mouseWorldY;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      // Check if within radius (considering the control point's render radius)
      const entityRadius = Render.radius[entity];
      const threshold = Math.max(clickRadius, entityRadius);
      
      if (distance < threshold && distance < closestDistance) {
        closestDistance = distance;
        hoveredEntity = entity;
      }
    }
    
    // Add Hover component to entity under mouse
    if (hoveredEntity !== null) {
      try {
        addComponent(world, hoveredEntity, Hover);
      } catch (e) {
        // Already has Hover component, ignore
      }
    }
  }
  
  // Handle mouse down -> drag activation
  if (mouseIsDown && mouseSelected > 0) {
    // Check if selected entity is draggable and not already dragging
    let isDraggable = false;
    for (let i = 0; i < draggableEntities.length; i++) {
      if (draggableEntities[i] === mouseSelected) {
        isDraggable = true;
        break;
      }
    }
    
    if (isDraggable) {
      // Check if already dragging
      let isAlreadyDragging = false;
      for (let i = 0; i < draggingEntities.length; i++) {
        if (draggingEntities[i] === mouseSelected) {
          isAlreadyDragging = true;
          break;
        }
      }
      
      if (!isAlreadyDragging) {
        addComponent(world, mouseSelected, Dragging);
        logger.info(`Started dragging entity ${mouseSelected}`);
      }
    }
  }
  
  // Handle mouse up -> drag deactivation
  if (!mouseIsDown) {
    // Remove Dragging component from all dragging entities
    for (let i = 0; i < draggingEntities.length; i++) {
      const entity = draggingEntities[i];
      removeComponent(world, entity, Dragging);
      logger.info(`Stopped dragging entity ${entity}`);
    }
  }
}

