export interface InputParams {
  state: "disabled" | "hover" | "dragging";  
  screenX: number;
  screenY: number;
  worldX: number;
  worldY: number;
  isDown: 0 | 1;
  // selected: number; // REMOVED
}

export type MouseEventHandler = (worldX: number, worldY: number) => void;


