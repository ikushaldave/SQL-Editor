/**
 * SQL Context Detector
 * Determines the SQL context at a given position
 * @packageDocumentation
 */

import type { Position } from '../types/common';
import type { SQLContext, SQLContextType, TableReference } from '../types/sql';
import { positionToOffset } from '../utils/position';

/**
 * Detect SQL context at a specific position
 *
 * @param sql - SQL string
 * @param position - Position in SQL
 * @param tableRefs - Available table references
 * @returns SQL context
 *
 * @example
 * ```typescript
 * const context = detectContext(
 *   'SELECT u. FROM users u',
 *   { line: 0, column: 9 },
 *   [{ name: 'users', alias: 'u' }]
 * );
 * 
 * // context.type === 'select_list'
 * // context.afterDot === true
 * // context.dotPrefix === 'u'
 * ```
 */
export function detectContext(
  sql: string,
  position: Position,
  tableRefs: TableReference[]
): SQLContext {
  const offset = positionToOffset(sql, position);
  const textBefore = sql.substring(0, offset);
  const textAfter = sql.substring(offset);

  // Get current and previous tokens
  const { currentToken, previousToken, afterDot, dotPrefix } = analyzeTokens(
    textBefore,
    textAfter
  );

  // Determine context type
  const type = determineContextType(textBefore);

  return {
    type,
    position,
    availableTables: tableRefs,
    currentToken,
    ...(previousToken !== undefined && { previousToken }),
    afterDot,
    ...(dotPrefix !== undefined && { dotPrefix }),
  };
}

/**
 * Analyze tokens around cursor position
 */
function analyzeTokens(textBefore: string, _textAfter: string): {
  currentToken: string;
  previousToken?: string;
  afterDot: boolean;
  dotPrefix?: string;
} {
  // Extract current token (partial word being typed)
  const currentMatch = textBefore.match(/[\w]*$/);
  const currentToken = currentMatch ? currentMatch[0] : '';

  // Check if we're after a dot
  const dotMatch = textBefore.match(/([\w]+)\.\s*[\w]*$/);
  const afterDot = !!dotMatch;
  const dotPrefix = dotMatch ? dotMatch[1] : undefined;

  // Extract previous token
  const prevMatch = textBefore.trimEnd().match(/[\w]+\s*$/);
  const previousToken = prevMatch && !afterDot ? prevMatch[0].trim() : undefined;

  const result: {
    currentToken: string;
    previousToken?: string;
    afterDot: boolean;
    dotPrefix?: string;
  } = {
    currentToken,
    afterDot,
  };

  if (previousToken !== undefined) {
    result.previousToken = previousToken;
  }
  if (dotPrefix !== undefined) {
    result.dotPrefix = dotPrefix;
  }

  return result;
}

/**
 * Determine the SQL context type from text
 */
function determineContextType(textBefore: string): SQLContextType {
  const upperText = textBefore.toUpperCase();

  // Check for specific clauses (in order of specificity)
  if (containsClause(upperText, 'HAVING')) {
    return 'having_clause';
  }

  if (containsClause(upperText, 'ORDER BY')) {
    return 'order_by';
  }

  if (containsClause(upperText, 'GROUP BY')) {
    return 'group_by';
  }

  if (containsClause(upperText, 'WHERE')) {
    return 'where_clause';
  }

  if (containsClause(upperText, 'JOIN') || containsClause(upperText, 'INNER JOIN') || 
      containsClause(upperText, 'LEFT JOIN') || containsClause(upperText, 'RIGHT JOIN')) {
    // If ON keyword is present after JOIN, we're in the join condition
    const afterJoin = upperText.substring(upperText.lastIndexOf('JOIN') + 4);
    if (afterJoin.includes('ON')) {
      return 'where_clause'; // Join conditions are similar to WHERE
    }
    return 'join_clause';
  }

  if (containsClause(upperText, 'FROM')) {
    // If we haven't hit WHERE/JOIN yet, we're still in FROM
    return 'from_clause';
  }

  if (containsClause(upperText, 'SELECT')) {
    return 'select_list';
  }

  // Check if inside function call
  const parenDepth = getParenthesisDepth(textBefore);
  if (parenDepth > 0) {
    return 'function';
  }

  return 'unknown';
}

/**
 * Check if text contains a SQL clause
 */
function containsClause(text: string, clause: string): boolean {
  // Use word boundary regex to avoid false positives
  const regex = new RegExp(`\\b${clause}\\b`, 'i');
  return regex.test(text);
}

/**
 * Get the current parenthesis depth
 */
function getParenthesisDepth(text: string): number {
  let depth = 0;
  for (const char of text) {
    if (char === '(') depth++;
    if (char === ')') depth--;
  }
  return Math.max(0, depth);
}

/**
 * Get the table reference for an alias
 *
 * @param alias - Table alias
 * @param tableRefs - Available table references
 * @returns Table reference or undefined
 */
export function resolveAlias(
  alias: string,
  tableRefs: TableReference[]
): TableReference | undefined {
  return tableRefs.find(
    (ref) =>
      ref.alias?.toLowerCase() === alias.toLowerCase() ||
      ref.name.toLowerCase() === alias.toLowerCase()
  );
}

