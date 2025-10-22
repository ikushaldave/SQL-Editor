/**
 * Schema Registry
 * Manages database schema metadata
 * @packageDocumentation
 */

import type {
  SchemaDefinition,
  DatabaseDefinition,
  TableDefinition,
  ColumnDefinition,
  SchemaItem,
} from '../types/schema';
import type { SchemaOptions } from '../types/config';
import { DEFAULT_SCHEMA_OPTIONS } from '../types/config';
import { createLogger } from '../utils/logger';
import type { Logger } from '../types/plugin';

/**
 * Schema Registry implementation
 *
 * @example
 * ```typescript
 * const registry = new SchemaRegistry();
 * 
 * registry.registerSchema({
 *   databases: {
 *     mydb: {
 *       tables: {
 *         users: {
 *           columns: {
 *             id: { type: 'int', primaryKey: true },
 *             name: { type: 'varchar', length: 255 }
 *           }
 *         }
 *       }
 *     }
 *   }
 * });
 * 
 * const table = registry.getTable('users');
 * ```
 */
export class SchemaRegistry {
  private schema: SchemaDefinition = { databases: {} };
  private searchIndex: Map<string, SchemaItem[]> = new Map();
  private logger: Logger;

  constructor(
    private readonly options: SchemaOptions = DEFAULT_SCHEMA_OPTIONS
  ) {
    this.logger = createLogger('SchemaRegistry');
  }

  /**
   * Register a schema definition
   *
   * @param schema - Schema definition to register
   */
  registerSchema(schema: SchemaDefinition): void {
    this.logger.debug('Registering schema');
    this.schema = schema;
    this.rebuildIndex();
  }

  /**
   * Get a specific database definition
   *
   * @param database - Database name
   * @returns Database definition or null if not found
   */
  getDatabase(database: string): DatabaseDefinition | null {
    const normalizedDb = this.normalizeName(database);
    
    // Try exact match first
    if (this.schema.databases[database]) {
      return this.schema.databases[database]!;
    }

    // Try normalized match
    for (const [dbName, dbDef] of Object.entries(this.schema.databases)) {
      if (this.normalizeName(dbName) === normalizedDb) {
        return dbDef;
      }
    }

    return null;
  }

  /**
   * Get a specific table definition
   *
   * @param tableName - Table name
   * @param database - Optional database name
   * @returns Table definition or null if not found
   */
  getTable(tableName: string, database?: string): TableDefinition | null {
    const normalizedTable = this.normalizeName(tableName);

    // If database is specified, search in that database only
    if (database) {
      const db = this.getDatabase(database);
      if (!db) return null;

      if (db.tables[tableName]) {
        return db.tables[tableName]!;
      }

      // Try normalized match
      for (const [tName, tDef] of Object.entries(db.tables)) {
        if (this.normalizeName(tName) === normalizedTable) {
          return tDef;
        }
      }

      return null;
    }

    // Search across all databases
    for (const db of Object.values(this.schema.databases)) {
      if (db.tables[tableName]) {
        return db.tables[tableName]!;
      }

      // Try normalized match
      for (const [tName, tDef] of Object.entries(db.tables)) {
        if (this.normalizeName(tName) === normalizedTable) {
          return tDef;
        }
      }
    }

    return null;
  }

  /**
   * Get columns for a specific table
   *
   * @param tableName - Table name
   * @param database - Optional database name
   * @returns Array of column definitions with names
   */
  getColumns(
    tableName: string,
    database?: string
  ): Array<ColumnDefinition & { name: string }> {
    const table = this.getTable(tableName, database);
    if (!table) return [];

    return Object.entries(table.columns).map(([name, def]) => ({
      ...def,
      name,
    }));
  }

  /**
   * Get all tables across all databases
   *
   * @param database - Optional database name to filter by
   * @returns Array of table definitions with names and database
   */
  getAllTables(database?: string): Array<TableDefinition & { name: string; database: string }> {
    const tables: Array<TableDefinition & { name: string; database: string }> = [];

    const databases = database
      ? { [database]: this.getDatabase(database) }
      : this.schema.databases;

    for (const [dbName, dbDef] of Object.entries(databases)) {
      if (!dbDef) continue;

      for (const [tableName, tableDef] of Object.entries(dbDef.tables)) {
        tables.push({
          ...tableDef,
          name: tableName,
          database: dbName,
        });
      }
    }

    return tables;
  }

  /**
   * Search schema items by query
   *
   * @param query - Search query
   * @param options - Search options
   * @returns Array of matching schema items
   */
  search(
    query: string,
    options?: {
      type?: 'database' | 'table' | 'column';
      database?: string;
      limit?: number;
    }
  ): SchemaItem[] {
    const normalizedQuery = this.normalizeName(query);
    const results: SchemaItem[] = [];

    // Search databases
    if (!options?.type || options.type === 'database') {
      for (const [dbName, dbDef] of Object.entries(this.schema.databases)) {
        if (this.matches(dbName, normalizedQuery)) {
          const item: SchemaItem = {
            type: 'database',
            name: dbName,
          };
          if (dbDef.comment) {
            item.detail = dbDef.comment;
          }
          results.push(item);
        }
      }
    }

    // Search tables
    if (!options?.type || options.type === 'table') {
      const tables = this.getAllTables(options?.database);
      for (const table of tables) {
        if (this.matches(table.name, normalizedQuery)) {
          const item: SchemaItem = {
            type: 'table',
            name: table.name,
            database: table.database,
            definition: table,
          };
          if (table.comment) {
            item.detail = table.comment;
          }
          results.push(item);
        }
      }
    }

    // Search columns
    if (!options?.type || options.type === 'column') {
      const tables = this.getAllTables(options?.database);
      for (const table of tables) {
        const columns = this.getColumns(table.name, table.database);
        for (const column of columns) {
          if (this.matches(column.name, normalizedQuery)) {
            results.push({
              type: 'column',
              name: column.name,
              table: table.name,
              database: table.database,
              detail: `${column.type}${column.comment ? ' - ' + column.comment : ''}`,
              definition: column,
            });
          }
        }
      }
    }

    // Apply limit
    if (options?.limit) {
      return results.slice(0, options.limit);
    }

    return results;
  }

  /**
   * Clear the schema registry
   */
  clear(): void {
    this.schema = { databases: {} };
    this.searchIndex.clear();
  }

  /**
   * Rebuild the search index
   */
  private rebuildIndex(): void {
    this.searchIndex.clear();
    // Index building logic can be enhanced in the future
    this.logger.debug('Search index rebuilt');
  }

  /**
   * Normalize a name for comparison
   */
  private normalizeName(name: string): string {
    return this.options.caseSensitive ? name : name.toLowerCase();
  }

  /**
   * Check if a name matches a query
   */
  private matches(name: string, query: string): boolean {
    const normalizedName = this.normalizeName(name);
    return normalizedName.includes(query) || normalizedName.startsWith(query);
  }
}

