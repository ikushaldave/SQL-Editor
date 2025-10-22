/**
 * SQL-specific types
 * @packageDocumentation
 */

import type { Position, Range } from './common';

/**
 * SQL context types indicating where the cursor is in the SQL statement
 */
export type SQLContextType =
  | 'select_list'      // In SELECT column list
  | 'from_clause'      // In FROM clause (table selection)
  | 'where_clause'     // In WHERE clause
  | 'join_clause'      // In JOIN clause
  | 'group_by'         // In GROUP BY clause
  | 'order_by'         // In ORDER BY clause
  | 'having_clause'    // In HAVING clause
  | 'function'         // Inside a function call
  | 'unknown';         // Unknown context

/**
 * SQL context information at a given position
 */
export interface SQLContext {
  /** The type of context */
  type: SQLContextType;
  /** Position where the context was detected */
  position: Position;
  /** Tables available in current scope */
  availableTables: TableReference[];
  /** Current token being typed */
  currentToken: string;
  /** Previous token */
  previousToken?: string;
  /** Whether we're after a dot (table.column) */
  afterDot: boolean;
  /** The table/alias before the dot if afterDot is true */
  dotPrefix?: string;
}

/**
 * Table reference in SQL
 */
export interface TableReference {
  /** Table name */
  name: string;
  /** Database/schema name */
  database?: string;
  /** Alias for the table */
  alias?: string;
  /** Whether this is a CTE */
  isCTE?: boolean;
  /** CTE column definitions if applicable */
  cteColumns?: string[];
}

/**
 * Alias mapping
 */
export interface AliasMap {
  /** Map from alias to table reference */
  [alias: string]: TableReference;
}

/**
 * Parse result
 */
export interface ParseResult {
  /** Whether parsing was successful */
  success: boolean;
  /** Abstract Syntax Tree (if successful) */
  ast?: any; // Type depends on dt-sql-parser
  /** Parse errors */
  errors: ParseError[];
  /** Table references found in SQL */
  tableRefs: TableReference[];
  /** Alias mappings */
  aliases: AliasMap;
}

/**
 * Parse error
 */
export interface ParseError {
  /** Error message */
  message: string;
  /** Error location */
  location?: Range;
  /** Error severity */
  severity: 'error' | 'warning' | 'info';
  /** Error code (if available) */
  code?: string;
}

/**
 * Validation error (extends parse error with additional context)
 */
export interface ValidationError extends ParseError {
  /** Type of validation error */
  type: 'syntax' | 'semantic' | 'custom';
  /** Suggested fix (optional) */
  suggestion?: string;
}

