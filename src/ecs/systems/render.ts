import { Position, Render, Path, PathLine, MouseIn } from '../components.js';
import { getRenderableEntities, getPathEntities, world } from '../world.js';
import { hasComponent } from 'bitecs';
import { GAME_CONFIG } from '../../config.js';
import { createLogger } from '../../logger/index.js';

const logger = createLogger('render');

// Helper function to generate smooth curve points using Catmull-Rom spline
function generateSmoothPoints(controlPoints: Array<{ x: number; y: number }>): Array<{ x: number; y: number }> {
  if (controlPoints.length < 2) return controlPoints;
  
  const points: Array<{ x: number; y: number }> = [];
  const segments = 20; // Number of intermediate points between each pair
  
  for (let i = 0; i < controlPoints.length; i++) {
    const p0 = controlPoints[i];
    const p1 = controlPoints[(i + 1) % controlPoints.length];
    const p2 = controlPoints[(i + 2) % controlPoints.length];
    const p3 = controlPoints[(i + 3) % controlPoints.length];
    
    for (let j = 0; j <= segments; j++) {
      const t = j / segments;
      const t2 = t * t;
      const t3 = t2 * t;
      
      // Catmull-Rom spline formula
      const x = 0.5 * (
        (2 * p1.x) +
        (-p0.x + p2.x) * t +
        (2 * p0.x - 5 * p1.x + 4 * p2.x - p3.x) * t2 +
        (-p0.x + 3 * p1.x - 3 * p2.x + p3.x) * t3
      );
      
      const y = 0.5 * (
        (2 * p1.y) +
        (-p0.y + p2.y) * t +
        (2 * p0.y - 5 * p1.y + 4 * p2.y - p3.y) * t2 +
        (-p0.y + 3 * p1.y - 3 * p2.y + p3.y) * t3
      );
      
      points.push({ x, y });
    }
  }
  
  return points;
}

function pathRenderSystem(ctx: CanvasRenderingContext2D, scaleX: number, scaleY: number) {
  const pathEntities = getPathEntities();
  
  for (let i = 0; i < pathEntities.length; i++) {
    const pathEntity = pathEntities[i];
    
    // Get path style properties
    const lineWidth = Path.lineWidth[pathEntity];
    const lineColor = Path.lineColor[pathEntity];
    
    // Traverse PathLine chain to collect control points
    const controlPointPositions: Array<{ x: number; y: number }> = [];
    let currentPathLine = Path.firstPathLine[pathEntity];
    const visited = new Set<number>();
    
    // Follow the linked list of PathLines
    while (currentPathLine > 0 && !visited.has(currentPathLine)) {
      visited.add(currentPathLine);
      
      const controlPointEntity = PathLine.startControlPoint[currentPathLine];
      
      // Get control point position
      controlPointPositions.push({
        x: Position.x[controlPointEntity],
        y: Position.y[controlPointEntity],
      });
      
      // Move to next PathLine in chain
      currentPathLine = PathLine.nextPathLine[currentPathLine];
      
      // If we've looped back to the start, we're done
      if (visited.has(currentPathLine)) {
        break;
      }
    }
    
    if (controlPointPositions.length < 2) continue;
    
    // Generate smooth curve points
    const smoothPoints = generateSmoothPoints(controlPointPositions);
    
    // Draw the path
    ctx.strokeStyle = `#${lineColor.toString(16).padStart(6, '0')}`;
    ctx.lineWidth = lineWidth;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    
    ctx.beginPath();
    for (let j = 0; j < smoothPoints.length; j++) {
      const point = smoothPoints[j];
      const x = point.x * scaleX;
      const y = point.y * scaleY;
      
      if (j === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }
    
    ctx.closePath();
    ctx.stroke();
  }
}

export function createRenderSystem(ctx: CanvasRenderingContext2D, scaleX: number, scaleY: number) {
  // Clear canvas
  function clear() {
    ctx.fillStyle = GAME_CONFIG.BACKGROUND_COLOR;
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  }
  
  // Render paths
  function renderPath() {
    pathRenderSystem(ctx, scaleX, scaleY);
  }
  
  // Render base control points (without MouseIn borders)
  function renderControlPoints() {
    const entities = getRenderableEntities();
    logger.info(`Render system: ${entities.length} entities found`);
    
    for (let i = 0; i < entities.length; i++) {
      const entity = entities[i];
      
      const x = Position.x[entity] * scaleX;
      const y = Position.y[entity] * scaleY;
      const radius = Render.radius[entity] * Math.min(scaleX, scaleY);
      const color = `#${Render.color[entity].toString(16).padStart(6, '0')}`;
      
      // Draw circle
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();
    }
  }
  
  // Render MouseIn borders on control points
  function renderControlPointsWithMouseIn() {
    const entities = getRenderableEntities();
    
    for (let i = 0; i < entities.length; i++) {
      const entity = entities[i];
      
      if (hasComponent(world, entity, MouseIn)) {
        const x = Position.x[entity] * scaleX;
        const y = Position.y[entity] * scaleY;
        const radius = Render.radius[entity] * Math.min(scaleX, scaleY);
        
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.strokeStyle = GAME_CONFIG.CONTROL_POINT.HOVER_BORDER_COLOR;
        ctx.lineWidth = GAME_CONFIG.CONTROL_POINT.HOVER_BORDER_WIDTH;
        ctx.stroke();
      }
    }
  }
  
  // Main render method
  function render(fps: number) {
    clear();
    renderPath();
    renderControlPoints();
    renderControlPointsWithMouseIn();
    
    // Draw FPS counter
    ctx.fillStyle = '#ffffff';
    ctx.font = '16px Arial';
    ctx.fillText(`FPS: ${fps.toFixed(1)}`, 10, 25);
  }
  
  return {
    render,
  };
}
