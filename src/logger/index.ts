export { Logger } from './Logger.js';
export { LoggerUtils } from './LoggerUtils.js';
export type { LogLevel, LogDomain, LogEntry, LoggerConfig, LoggerUtilsConfig } from './types.js';
import { Logger } from './Logger.js';
import { LoggerUtils } from './LoggerUtils.js';
import type { LogDomain } from './types.js';

// Convenience function to create a logger with a specific domain
export function createLogger(domain: LogDomain, utils?: LoggerUtils): Logger {
  return new Logger(domain, utils);
}

// Global logger utils instance for shared configuration
export const globalLoggerUtils = new LoggerUtils();



