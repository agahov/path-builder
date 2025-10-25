import { LogLevel, LogDomain, LogEntry } from './types.js';
import { LoggerUtils } from './LoggerUtils.js';

export class Logger {
  private utils: LoggerUtils;
  private domain: LogDomain;

  constructor(domain: LogDomain, utils?: LoggerUtils) {
    this.domain = domain;
    this.utils = utils || new LoggerUtils();
  }

  private createLogEntry(level: LogLevel, message: string, data?: any): LogEntry {
    return {
      level,
      domain: this.domain,
      message,
      timestamp: new Date(),
      data
    };
  }

  private shouldLog(level: LogLevel): boolean {
    return this.utils.shouldLog(level, this.domain);
  }

  private formatMessage(entry: LogEntry): string {
    const config = this.utils.getConfig();
    let formatted = '';

    if (config.enableTimestamp) {
      formatted += `[${entry.timestamp.toISOString()}] `;
    }

    formatted += `[${entry.level.toUpperCase()}] `;
    formatted += `[${entry.domain}] `;
    formatted += entry.message;

    if (entry.data !== undefined) {
      formatted += ` | Data: ${JSON.stringify(entry.data)}`;
    }

    return formatted;
  }

  private output(entry: LogEntry): void {
    const config = this.utils.getConfig();
    
    if (!config.enableConsole) {
      return;
    }

    const formattedMessage = this.formatMessage(entry);

    switch (entry.level) {
      case 'error':
        console.error(formattedMessage);
        break;
      case 'warning':
        console.warn(formattedMessage);
        break;
      case 'info':
        console.info(formattedMessage);
        break;
      case 'debug':
        console.debug(formattedMessage);
        break;
      default:
        console.log(formattedMessage);
    }
  }

  private log(level: LogLevel, message: string, data?: any): void {
    if (!this.shouldLog(level)) {
      return;
    }

    const entry = this.createLogEntry(level, message, data);
    this.output(entry);
  }

  // Public logging methods
  public error(message: string, data?: any): void {
    this.log('error', message, data);
  }

  public warning(message: string, data?: any): void {
    this.log('warning', message, data);
  }

  public info(message: string, data?: any): void {
    this.log('info', message, data);
  }

  public debug(message: string, data?: any): void {
    this.log('debug', message, data);
  }

  // Utility methods
  public getDomain(): LogDomain {
    return this.domain;
  }

  public getUtils(): LoggerUtils {
    return this.utils;
  }

  public setDomain(domain: LogDomain): void {
    this.domain = domain;
  }
}



