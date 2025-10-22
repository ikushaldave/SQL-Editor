/**
 * Common types used throughout the SQL editor
 * @packageDocumentation
 */

/**
 * Represents a position in the editor
 */
export interface Position {
  /** Line number (0-based) */
  line: number;
  /** Column number (0-based) */
  column: number;
}

/**
 * Represents a range in the editor
 */
export interface Range {
  /** Start position */
  start: Position;
  /** End position */
  end: Position;
}

/**
 * SQL dialect types
 */
export type SQLDialect = 'mysql' | 'postgresql' | 'flink' | 'spark' | 'hive' | 'trino' | 'impala';

/**
 * Log levels
 */
export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

/**
 * Generic result type
 */
export interface Result<T, E = Error> {
  /** Whether the operation was successful */
  success: boolean;
  /** Data if successful */
  data?: T;
  /** Error if failed */
  error?: E;
}

