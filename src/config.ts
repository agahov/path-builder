export const GAME_CONFIG = {
  // Base canvas dimensions
  CANVAS_WIDTH: 1920,
  CANVAS_HEIGHT: 1080,
  
  // Colors
  BACKGROUND_COLOR: '#000000',
  
  // Entity defaults
  DEFAULT_ENTITY_COUNT: 8,
  MIN_RADIUS: 10,
  MAX_RADIUS: 30,
  MIN_VELOCITY: -100,
  MAX_VELOCITY: 100,
  
  // FPS
  TARGET_FPS: 60,
  FPS_UPDATE_INTERVAL: 1000, // Update FPS display every 1000ms
} as const;

export const LOGGER_CONFIG = {
  // Default logger settings
  DEFAULT_LEVEL: 'info' as const,
  DEFAULT_DOMAIN: 'app' as const,
  
  // Enable all domains and levels by default
  ENABLE_ALL_DOMAINS: true,
  ENABLE_ALL_LEVELS: true,
  
  // Console output settings
  ENABLE_TIMESTAMP: true,
  ENABLE_CONSOLE: true,
  
  // Common domains for the game
  DOMAINS: {
    GAME: 'game',
    RENDER: 'render',
    MOVEMENT: 'movement',
    ENTITIES: 'entities',
    ECS: 'ecs',
    INPUT: 'input',
    AUDIO: 'audio',
    NETWORK: 'network',
    FILE: 'file'
  } as const,
} as const;

export type GameConfig = typeof GAME_CONFIG;
export type LoggerConfig = typeof LOGGER_CONFIG;
