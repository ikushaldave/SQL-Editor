/**
 * Logger utility
 * @packageDocumentation
 */

import type { Logger, LogLevel } from '../types';

/**
 * Simple logger implementation
 */
export class SimpleLogger implements Logger {
  constructor(
    private readonly name: string,
    private readonly level: LogLevel = 'info'
  ) {}

  private shouldLog(level: LogLevel): boolean {
    const levels: LogLevel[] = ['debug', 'info', 'warn', 'error'];
    const currentLevel = levels.indexOf(this.level);
    const messageLevel = levels.indexOf(level);
    return messageLevel >= currentLevel;
  }

  private format(level: LogLevel, message: string, args: any[]): string {
    const timestamp = new Date().toISOString();
    const argsStr = args.length > 0 ? ' ' + JSON.stringify(args) : '';
    return `[${timestamp}] [${level.toUpperCase()}] [${this.name}] ${message}${argsStr}`;
  }

  debug(message: string, ...args: any[]): void {
    if (this.shouldLog('debug')) {
      console.debug(this.format('debug', message, args));
    }
  }

  info(message: string, ...args: any[]): void {
    if (this.shouldLog('info')) {
      console.info(this.format('info', message, args));
    }
  }

  warn(message: string, ...args: any[]): void {
    if (this.shouldLog('warn')) {
      console.warn(this.format('warn', message, args));
    }
  }

  error(message: string, ...args: any[]): void {
    if (this.shouldLog('error')) {
      console.error(this.format('error', message, args));
    }
  }
}

/**
 * Create a logger instance
 *
 * @param name - Logger name
 * @param level - Log level
 * @returns Logger instance
 */
export function createLogger(name: string, level: LogLevel = 'info'): Logger {
  return new SimpleLogger(name, level);
}

