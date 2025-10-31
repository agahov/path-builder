// Position component - x, y coordinates
export const Position = {
  x: [] as number[],
  y: [] as number[],
};

// Movement component - velocity in x and y directions
export const Movement = {
  velocityX: [] as number[],
  velocityY: [] as number[],
};

// Render component - visual properties
export const Render = {
  color: [] as number[], // Color as hex value (0xRRGGBB)
  radius: [] as number[],
};

// Path component - holds first PathLine entity ID and rendering style
export const Path = {
  firstPathLine: [] as number[],   // Entity ID of first PathLine in chain
  lineWidth: [] as number[],        // Rendering style for entire path
  lineColor: [] as number[],        // Color as hex value
  smoothness: [] as number[],       // Curve smoothness factor (0-1)
};

// PathLine component - forms linked chain between control points
export const PathLine = {
  startControlPoint: [] as number[], // Entity ID of start control point
  nextPathLine: [] as number[],      // Entity ID of next PathLine (0 for none)
};

// PathParent component - references parent path
export const PathParent = {
  pathEntityId: [] as number[],     // Reference to parent path entity
};

// ControlPoint component - marker for control point entities
export const ControlPoint = {
  isControlPoint: [] as number[],   // Flag marker (1 = true, 0 = false)
};

// Draggable component - marker for entities that can be dragged (tag only)
export const Draggable = {};

// Dragging component - marker for entities currently being dragged (tag only)
export const Dragging = {};

// Hover component - marker for entities currently hovered (tag only)
export const Hover = {};

// Mouse component - global mouse state (single entity)
export const Mouse = {
  screenX: [] as number[],
  screenY: [] as number[],
  worldX: [] as number[],
  worldY: [] as number[],
  isDown: [] as number[],     // 1 = mouse down, 0 = mouse up
  selected: [] as number[], // Entity selected on mouseDown, cleared when new entity found or mouseUp
};

