/**
 * Column completion provider
 * @packageDocumentation
 */

import type { CompletionProvider, Completion } from '../../types/autocomplete';
import type { SQLContext } from '../../types/sql';
import type { SchemaRegistry } from '../../schema/schema-registry';
import { resolveAlias } from '../../parser/context-detector';

/**
 * Provides column name completions
 *
 * @example
 * ```typescript
 * const provider = new ColumnCompletionProvider();
 * const completions = provider.provide(context, schema);
 * ```
 */
export class ColumnCompletionProvider implements CompletionProvider {
  canProvide(context: SQLContext): boolean {
    // Provide column completions in:
    // - SELECT list
    // - WHERE clause
    // - GROUP BY, ORDER BY, HAVING
    // - After a dot (table.column)
    return (
      context.type === 'select_list' ||
      context.type === 'where_clause' ||
      context.type === 'group_by' ||
      context.type === 'order_by' ||
      context.type === 'having_clause' ||
      context.afterDot
    );
  }

  provide(context: SQLContext, schema: SchemaRegistry): Completion[] {
    const completions: Completion[] = [];

    // If after dot, provide columns for specific table/alias
    if (context.afterDot && context.dotPrefix) {
      const table = resolveAlias(context.dotPrefix, context.availableTables);
      if (table) {
        const columns = schema.getColumns(table.name, table.database);
        for (const column of columns) {
          completions.push({
            label: column.name,
            type: 'column',
            detail: `${column.type}${column.nullable === false ? ' NOT NULL' : ''}`,
            documentation: column.comment || `Column: ${table.name}.${column.name}`,
            sortPriority: 0, // Highest priority for aliased columns
            metadata: {
              tableName: table.name,
              columnType: column.type,
              nullable: column.nullable,
            },
          });
        }
      }
      return completions;
    }

    // Otherwise, provide columns from all available tables
    for (const tableRef of context.availableTables) {
      const columns = schema.getColumns(tableRef.name, tableRef.database);
      const prefix = tableRef.alias || tableRef.name;

      for (const column of columns) {
        completions.push({
          label: column.name,
          type: 'column',
          detail: `${prefix}.${column.name} (${column.type})`,
          documentation: column.comment || `Column: ${tableRef.name}.${column.name}`,
          insertText: `${prefix}.${column.name}`,
          sortPriority: 2, // Lower priority than dot-prefixed
          metadata: {
            tableName: tableRef.name,
            columnType: column.type,
            nullable: column.nullable,
            prefix: prefix,
          },
        });
      }
    }

    return completions;
  }
}

