import { LogLevel, LogDomain, LoggerConfig, LoggerUtilsConfig } from './types.js';

export class LoggerUtils {
  private config: LoggerUtilsConfig;
  private loggerConfig: LoggerConfig;

  constructor(config: Partial<LoggerUtilsConfig> = {}) {
    this.config = {
      defaultLevel: 'info',
      defaultDomain: 'app',
      enableAllDomains: true,
      enableAllLevels: true,
      ...config
    };

    this.loggerConfig = {
      enabledDomains: new Set(),
      enabledLevels: new Set(),
      enableTimestamp: true,
      enableConsole: true
    };

    this.initializeDefaults();
  }

  private initializeDefaults(): void {
    if (this.config.enableAllDomains) {
      this.enableAllDomains();
    } else {
      this.enableDomain(this.config.defaultDomain);
    }

    if (this.config.enableAllLevels) {
      this.enableAllLevels();
    } else {
      this.enableLevel(this.config.defaultLevel);
    }
  }

  // Domain management
  public enableDomain(domain: LogDomain): void {
    this.loggerConfig.enabledDomains.add(domain);
  }

  public disableDomain(domain: LogDomain): void {
    this.loggerConfig.enabledDomains.delete(domain);
  }

  public enableAllDomains(): void {
    this.loggerConfig.enabledDomains.clear();
    this.config.enableAllDomains = true;
  }

  public disableAllDomains(): void {
    this.loggerConfig.enabledDomains.clear();
    this.config.enableAllDomains = false;
  }

  public isDomainEnabled(domain: LogDomain): boolean {
    return this.config.enableAllDomains || this.loggerConfig.enabledDomains.has(domain);
  }

  public getEnabledDomains(): LogDomain[] {
    return Array.from(this.loggerConfig.enabledDomains);
  }

  // Level management
  public enableLevel(level: LogLevel): void {
    this.loggerConfig.enabledLevels.add(level);
  }

  public disableLevel(level: LogLevel): void {
    this.loggerConfig.enabledLevels.delete(level);
  }

  public enableAllLevels(): void {
    this.loggerConfig.enabledLevels.clear();
    this.config.enableAllLevels = true;
  }

  public disableAllLevels(): void {
    this.loggerConfig.enabledLevels.clear();
    this.config.enableAllLevels = false;
  }

  public isLevelEnabled(level: LogLevel): boolean {
    return this.config.enableAllLevels || this.loggerConfig.enabledLevels.has(level);
  }

  public getEnabledLevels(): LogLevel[] {
    return Array.from(this.loggerConfig.enabledLevels);
  }

  // Level hierarchy check
  public shouldLog(level: LogLevel, domain: LogDomain): boolean {
    if (!this.isDomainEnabled(domain)) {
      return false;
    }

    if (this.config.enableAllLevels) {
      return true;
    }

    const levelHierarchy: Record<LogLevel, number> = {
      error: 0,
      warning: 1,
      info: 2,
      debug: 3
    };

    const enabledLevels = this.getEnabledLevels();
    if (enabledLevels.length === 0) {
      return false;
    }

    const minEnabledLevel = Math.min(...enabledLevels.map(l => levelHierarchy[l]));
    return levelHierarchy[level] >= minEnabledLevel;
  }

  // Configuration management
  public getConfig(): LoggerConfig {
    return { ...this.loggerConfig };
  }

  public updateConfig(updates: Partial<LoggerConfig>): void {
    Object.assign(this.loggerConfig, updates);
  }

  public resetConfig(): void {
    this.loggerConfig = {
      enabledDomains: new Set(),
      enabledLevels: new Set(),
      enableTimestamp: true,
      enableConsole: true
    };
    this.initializeDefaults();
  }

  // Utility methods
  public setDefaultDomain(domain: LogDomain): void {
    this.config.defaultDomain = domain;
  }

  public setDefaultLevel(level: LogLevel): void {
    this.config.defaultLevel = level;
  }

  public getDefaultDomain(): LogDomain {
    return this.config.defaultDomain;
  }

  public getDefaultLevel(): LogLevel {
    return this.config.defaultLevel;
  }
}



