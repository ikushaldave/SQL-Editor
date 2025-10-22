/**
 * SQL keyword completion provider
 * @packageDocumentation
 */

import type { CompletionProvider, Completion } from '../../types/autocomplete';
import type { SQLContext } from '../../types/sql';
import type { SchemaRegistry } from '../../schema/schema-registry';

/**
 * Common SQL keywords
 */
const SQL_KEYWORDS = [
  // Main clauses
  'SELECT', 'FROM', 'WHERE', 'GROUP BY', 'HAVING', 'ORDER BY',
  'LIMIT', 'OFFSET',
  
  // Joins
  'JOIN', 'INNER JOIN', 'LEFT JOIN', 'RIGHT JOIN', 'FULL JOIN',
  'CROSS JOIN', 'ON', 'USING',
  
  // Set operations
  'UNION', 'UNION ALL', 'INTERSECT', 'EXCEPT',
  
  // DML
  'INSERT INTO', 'UPDATE', 'DELETE FROM', 'VALUES', 'SET',
  
  // DDL
  'CREATE TABLE', 'ALTER TABLE', 'DROP TABLE',
  'CREATE INDEX', 'DROP INDEX',
  
  // Conditions
  'AND', 'OR', 'NOT', 'IN', 'BETWEEN', 'LIKE', 'IS NULL', 'IS NOT NULL',
  'EXISTS', 'ANY', 'ALL',
  
  // Aggregates
  'DISTINCT', 'AS',
  
  // Ordering
  'ASC', 'DESC',
];

/**
 * Provides SQL keyword completions
 *
 * @example
 * ```typescript
 * const provider = new KeywordCompletionProvider();
 * const completions = provider.provide(context, schema);
 * ```
 */
export class KeywordCompletionProvider implements CompletionProvider {
  canProvide(context: SQLContext): boolean {
    // Provide keywords in most contexts, but not after a dot
    return !context.afterDot;
  }

  provide(context: SQLContext, _schema: SchemaRegistry): Completion[] {
    const completions: Completion[] = [];

    for (const keyword of SQL_KEYWORDS) {
      completions.push({
        label: keyword,
        type: 'keyword',
        detail: 'SQL Keyword',
        sortPriority: 5, // Lower priority than tables/columns
      });
    }

    // Add context-specific keywords with higher priority
    const contextKeywords = this.getContextKeywords(context);
    for (const keyword of contextKeywords) {
      completions.push({
        label: keyword,
        type: 'keyword',
        detail: 'SQL Keyword',
        sortPriority: 3, // Higher priority for context-specific
      });
    }

    return completions;
  }

  /**
   * Get keywords relevant to current context
   */
  private getContextKeywords(context: SQLContext): string[] {
    switch (context.type) {
      case 'select_list':
        return ['DISTINCT', 'AS', 'FROM'];
      
      case 'from_clause':
        return ['JOIN', 'INNER JOIN', 'LEFT JOIN', 'RIGHT JOIN', 'WHERE'];
      
      case 'where_clause':
        return ['AND', 'OR', 'GROUP BY', 'ORDER BY', 'LIMIT'];
      
      case 'join_clause':
        return ['ON', 'USING', 'AND'];
      
      case 'group_by':
        return ['HAVING', 'ORDER BY'];
      
      case 'order_by':
        return ['ASC', 'DESC', 'LIMIT'];
      
      default:
        return [];
    }
  }
}

