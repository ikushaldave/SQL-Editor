/**
 * Table completion provider
 * @packageDocumentation
 */

import type { CompletionProvider, Completion } from '../../types/autocomplete';
import type { SQLContext } from '../../types/sql';
import type { SchemaRegistry } from '../../schema/schema-registry';

/**
 * Provides table name completions
 *
 * @example
 * ```typescript
 * const provider = new TableCompletionProvider();
 * const completions = provider.provide(context, schema);
 * ```
 */
export class TableCompletionProvider implements CompletionProvider {
  canProvide(context: SQLContext): boolean {
    // Provide table completions in FROM and JOIN clauses
    return (
      context.type === 'from_clause' ||
      context.type === 'join_clause'
    ) && !context.afterDot;
  }

  provide(_context: SQLContext, schema: SchemaRegistry): Completion[] {
    const completions: Completion[] = [];

    // Get all tables from schema
    const tables = schema.getAllTables();

    for (const table of tables) {
      completions.push({
        label: table.name,
        type: 'table',
        detail: table.database ? `${table.database}.${table.name}` : table.name,
        documentation: table.comment || `Table: ${table.name}`,
        sortPriority: 1,
        metadata: {
          database: table.database,
          tableName: table.name,
        },
      });
    }

    return completions;
  }
}

