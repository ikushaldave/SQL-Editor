/**
 * SQL function completion provider
 * @packageDocumentation
 */

import type { CompletionProvider, Completion } from '../../types/autocomplete';
import type { SQLContext } from '../../types/sql';
import type { SchemaRegistry } from '../../schema/schema-registry';

/**
 * Common SQL functions
 */
const SQL_FUNCTIONS = [
  // Aggregate functions
  { name: 'COUNT', args: 'column', description: 'Count rows or non-null values' },
  { name: 'SUM', args: 'column', description: 'Calculate sum of values' },
  { name: 'AVG', args: 'column', description: 'Calculate average of values' },
  { name: 'MIN', args: 'column', description: 'Find minimum value' },
  { name: 'MAX', args: 'column', description: 'Find maximum value' },
  
  // String functions
  { name: 'CONCAT', args: 'str1, str2, ...', description: 'Concatenate strings' },
  { name: 'SUBSTRING', args: 'str, start, length', description: 'Extract substring' },
  { name: 'UPPER', args: 'str', description: 'Convert to uppercase' },
  { name: 'LOWER', args: 'str', description: 'Convert to lowercase' },
  { name: 'TRIM', args: 'str', description: 'Remove leading/trailing spaces' },
  { name: 'LENGTH', args: 'str', description: 'Get string length' },
  
  // Date functions
  { name: 'NOW', args: '', description: 'Current date and time' },
  { name: 'CURDATE', args: '', description: 'Current date' },
  { name: 'DATE_ADD', args: 'date, INTERVAL value unit', description: 'Add interval to date' },
  { name: 'DATE_SUB', args: 'date, INTERVAL value unit', description: 'Subtract interval from date' },
  { name: 'DATEDIFF', args: 'date1, date2', description: 'Difference between dates' },
  
  // Math functions
  { name: 'ROUND', args: 'number, decimals', description: 'Round number' },
  { name: 'FLOOR', args: 'number', description: 'Round down' },
  { name: 'CEIL', args: 'number', description: 'Round up' },
  { name: 'ABS', args: 'number', description: 'Absolute value' },
  
  // Conditional
  { name: 'COALESCE', args: 'value1, value2, ...', description: 'Return first non-null value' },
  { name: 'NULLIF', args: 'value1, value2', description: 'Return null if values are equal' },
  { name: 'IFNULL', args: 'value, default', description: 'Return default if value is null' },
  { name: 'CASE', args: 'WHEN condition THEN result ... END', description: 'Conditional expression' },
];

/**
 * Provides SQL function completions
 *
 * @example
 * ```typescript
 * const provider = new FunctionCompletionProvider();
 * const completions = provider.provide(context, schema);
 * ```
 */
export class FunctionCompletionProvider implements CompletionProvider {
  canProvide(context: SQLContext): boolean {
    // Provide functions in SELECT list, WHERE clause, and similar contexts
    return (
      context.type === 'select_list' ||
      context.type === 'where_clause' ||
      context.type === 'having_clause' ||
      context.type === 'order_by' ||
      context.type === 'function'
    ) && !context.afterDot;
  }

  provide(_context: SQLContext, _schema: SchemaRegistry): Completion[] {
    const completions: Completion[] = [];

    for (const func of SQL_FUNCTIONS) {
      completions.push({
        label: func.name,
        type: 'function',
        detail: `${func.name}(${func.args})`,
        documentation: func.description,
        insertText: `${func.name}(${func.args ? '$1' : ''})`,
        sortPriority: 4,
      });
    }

    return completions;
  }
}

