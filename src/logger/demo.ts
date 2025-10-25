import { createLogger, globalLoggerUtils, LoggerUtils } from './index.js';
import { LOGGER_CONFIG } from '../config.js';

// Demo function to showcase logger functionality
export function demonstrateLogger(): void {
  console.log('=== Logger Demonstration ===\n');

  // Create loggers for different domains
  const gameLogger = createLogger(LOGGER_CONFIG.DOMAINS.GAME, globalLoggerUtils);
  const renderLogger = createLogger(LOGGER_CONFIG.DOMAINS.RENDER, globalLoggerUtils);
  const fileLogger = createLogger(LOGGER_CONFIG.DOMAINS.FILE, globalLoggerUtils);
  const movementLogger = createLogger(LOGGER_CONFIG.DOMAINS.MOVEMENT, globalLoggerUtils);

  console.log('1. Basic logging with all levels:');
  gameLogger.error('Critical game error occurred!');
  gameLogger.warning('Low memory warning');
  gameLogger.info('Game initialized successfully');
  gameLogger.debug('Debug information about game state');

  console.log('\n2. Logging with data objects:');
  renderLogger.info('Rendering frame', { 
    frameNumber: 42, 
    entities: 8, 
    fps: 60 
  });
  
  fileLogger.debug('File operation completed', {
    filename: 'config.json',
    size: 1024,
    duration: 15.5
  });

  console.log('\n3. Domain filtering - disabling file domain:');
  globalLoggerUtils.disableDomain(LOGGER_CONFIG.DOMAINS.FILE);
  fileLogger.info('This should not appear');
  fileLogger.error('This should not appear either');
  gameLogger.info('This should still appear');

  console.log('\n4. Level filtering - only showing error and warning:');
  globalLoggerUtils.disableAllLevels();
  globalLoggerUtils.enableLevel('error');
  globalLoggerUtils.enableLevel('warning');
  
  gameLogger.debug('This debug message should not appear');
  gameLogger.info('This info message should not appear');
  gameLogger.warning('This warning should appear');
  gameLogger.error('This error should appear');

  console.log('\n5. Re-enabling all levels and domains:');
  globalLoggerUtils.enableAllLevels();
  globalLoggerUtils.enableAllDomains();
  
  gameLogger.info('All logging restored');
  fileLogger.info('File logging restored');

  console.log('\n6. Custom logger utils configuration:');
  const customUtils = new LoggerUtils({
    defaultDomain: 'custom',
    defaultLevel: 'debug',
    enableAllDomains: false,
    enableAllLevels: false
  });
  
  customUtils.enableDomain('custom');
  customUtils.enableLevel('debug');
  customUtils.enableLevel('info');
  
  const customLogger = createLogger('custom', customUtils);
  customLogger.debug('Custom logger with specific configuration');
  customLogger.info('This should appear');
  customLogger.warning('This should not appear (level not enabled)');

  console.log('\n7. Logger utils management:');
  console.log('Enabled domains:', customUtils.getEnabledDomains());
  console.log('Enabled levels:', customUtils.getEnabledLevels());
  console.log('Should log debug for custom domain:', customUtils.shouldLog('debug', 'custom'));
  console.log('Should log warning for custom domain:', customUtils.shouldLog('warning', 'custom'));

  console.log('\n=== Logger Demonstration Complete ===');
}

// Function to demonstrate file domain logging specifically
export function demonstrateFileLogging(): void {
  const fileLogger = createLogger(LOGGER_CONFIG.DOMAINS.FILE, globalLoggerUtils);
  
  console.log('\n=== File Domain Logging Demo ===');
  
  fileLogger.info('File system initialized');
  fileLogger.debug('Reading configuration file', { path: './config.json' });
  fileLogger.info('Configuration loaded successfully', { 
    settings: { 
      width: 1920, 
      height: 1080 
    } 
  });
  fileLogger.warning('File cache is getting large', { 
    cacheSize: '50MB', 
    maxSize: '100MB' 
  });
  fileLogger.error('Failed to write log file', { 
    error: 'Permission denied', 
    path: '/var/log/game.log' 
  });
  
  console.log('=== File Domain Logging Demo Complete ===\n');
}



