export type LogLevel = 'error' | 'warning' | 'info' | 'debug';

export type LogDomain = string;

export interface LogEntry {
  level: LogLevel;
  domain: LogDomain;
  message: string;
  timestamp: Date;
  data?: any;
}

export interface LoggerConfig {
  enabledDomains: Set<LogDomain>;
  enabledLevels: Set<LogLevel>;
  enableTimestamp: boolean;
  enableConsole: boolean;
}

export interface LoggerUtilsConfig {
  defaultLevel: LogLevel;
  defaultDomain: LogDomain;
  enableAllDomains: boolean;
  enableAllLevels: boolean;
}



