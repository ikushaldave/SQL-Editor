/**
 * Parser Service
 * Wraps dt-sql-parser with enhanced functionality including variable support
 * @packageDocumentation
 */

import { MySQL, PostgreSQL, FlinkSQL, SparkSQL, HiveSQL, TrinoSQL, ImpalaSQL } from 'dt-sql-parser';
import type { ParseResult, TableReference, AliasMap } from '../types/sql';
import type { SQLDialect } from '../types/common';
import { createLogger } from '../utils/logger';
import type { Logger } from '../types/plugin';
import { VariableHandler } from './variable-handler';
import { SQL_DIALECTS } from '../constants';

/**
 * Parser Service implementation
 *
 * @example
 * ```typescript
 * const parser = new ParserService('mysql');
 * parser.setOptions({ embeddedVariables: true });
 * const result = parser.parse('SELECT * FROM $(table) WHERE id = $(id)');
 * 
 * if (result.success) {
 *   console.log('Tables:', result.tableRefs);
 *   console.log('Aliases:', result.aliases);
 * }
 * ```
 */
export class ParserService {
  private parser: MySQL | PostgreSQL | FlinkSQL | SparkSQL | HiveSQL | TrinoSQL | ImpalaSQL;
  private logger: Logger;
  private variableHandler: VariableHandler;
  private embeddedVariables: boolean = false;
  private dialect: SQLDialect;

  constructor(dialect: SQLDialect = 'mysql') {
    this.logger = createLogger('ParserService');
    this.variableHandler = new VariableHandler();
    this.dialect = dialect;
    
    // Initialize parser based on dialect
    this.parser = this.createParser(dialect);
  }

  /**
   * Create parser instance based on dialect
   */
  private createParser(dialect: SQLDialect): MySQL | PostgreSQL | FlinkSQL | SparkSQL | HiveSQL | TrinoSQL | ImpalaSQL {
    switch (dialect) {
      case SQL_DIALECTS.MYSQL:
        return new MySQL();
      case SQL_DIALECTS.POSTGRESQL:
        return new PostgreSQL();
      case SQL_DIALECTS.FLINK:
        return new FlinkSQL();
      case SQL_DIALECTS.SPARK:
        return new SparkSQL();
      case SQL_DIALECTS.HIVE:
        return new HiveSQL();
      case SQL_DIALECTS.TRINO:
        return new TrinoSQL();
      case SQL_DIALECTS.IMPALA:
        return new ImpalaSQL();
      default:
        this.logger.warn(`Unknown dialect: ${dialect}, falling back to MySQL`);
        return new MySQL();
    }
  }

  /**
   * Get current dialect
   */
  getDialect(): SQLDialect {
    return this.dialect;
  }

  /**
   * Set dialect and reinitialize parser
   */
  setDialect(dialect: SQLDialect): void {
    this.dialect = dialect;
    this.parser = this.createParser(dialect);
    this.logger.debug(`Dialect changed to: ${dialect}`);
  }

  /**
   * Set parser options
   *
   * @param options - Parser options
   */
  setOptions(options: { embeddedVariables?: boolean }): void {
    this.embeddedVariables = options.embeddedVariables ?? false;
  }

  /**
   * Parse SQL and return detailed results
   *
   * @param sql - SQL string to parse
   * @returns Parse result with AST, errors, and metadata
   */
  parse(sql: string): ParseResult {
    try {
      let sqlToParse = sql;
      let variableMap: any = {};

      // Handle embedded variables if enabled
      if (this.embeddedVariables && this.variableHandler.hasVariables(sql)) {
        const escaped = this.variableHandler.escapeVariables(sql);
        sqlToParse = escaped.escapedSql;
        variableMap = escaped.variableMap;
      }

      const ast = this.parser.parse(sqlToParse);
      const errors = this.parser.validate(sqlToParse);
      
      const result: ParseResult = {
        success: errors.length === 0,
        ast: ast,
        errors: errors.map((err: any) => {
          const error: any = {
            message: err.message || 'Parse error',
            severity: 'error' as const,
          };

          if (err.startLine !== undefined) {
            error.location = {
              start: {
                line: err.startLine - 1, // Convert to 0-based
                column: (err.startColumn || 1) - 1,
              },
              end: {
                line: (err.endLine || err.startLine) - 1,
                column: (err.endColumn || err.startColumn || 1) - 1,
              },
            };
          }

          return error;
        }),
        tableRefs: [],
        aliases: {},
      };

      // Revert error positions if variables were escaped
      if (this.embeddedVariables && Object.keys(variableMap).length > 0) {
        result.errors = this.variableHandler.revertErrorPositions(
          result.errors as any,
          sql,
          sqlToParse,
          variableMap
        ) as any;
      }

      // Extract table references and aliases
      // Try AST-based extraction first
      result.tableRefs = this.extractTableRefs(ast);
      
      // Always also try regex fallback and merge results
      // This ensures we catch tables even if AST traversal misses some
      const regexTables = this.extractTableRefsFromRegex(sql);
      
      // Merge regex results, avoiding duplicates
      for (const regexTable of regexTables) {
        const exists = result.tableRefs.find(
          t => t.name === regexTable.name && t.alias === regexTable.alias
        );
        if (!exists) {
          result.tableRefs.push(regexTable);
        }
      }
      
      result.aliases = this.extractAliases(result.tableRefs);

      return result;
    } catch (error) {
      this.logger.error('Parse error:', error);
      return {
        success: false,
        errors: [{
          message:
            error instanceof Error ? error.message : 'Unknown parse error',
          severity: 'error',
        }],
        tableRefs: [],
        aliases: {},
      };
    }
  }

  /**
   * Extract table references from AST
   *
   * @param ast - Abstract Syntax Tree
   * @returns Array of table references
   */
  extractTableRefs(ast: any): TableReference[] {
    const tables: TableReference[] = [];

    try {
      // Handle different AST structures from dt-sql-parser
      if (!ast) return tables;

      // Extract FROM clause tables using AST
      this.traverseAST(ast, (node: any) => {
        // Table reference in FROM clause
        if (node.type === 'table' && node.table) {
          const table: TableReference = {
            name: node.table,
            database: node.db || undefined,
            alias: node.as || undefined,
          };
          tables.push(table);
        }

        // CTE (Common Table Expression)
        if (node.type === 'cte' && node.name) {
          const table: TableReference = {
            name: node.name,
            alias: node.name,
            isCTE: true,
            cteColumns: node.columns || [],
          };
          tables.push(table);
        }
      });

      return tables;
    } catch (error) {
      this.logger.error('Error extracting table refs:', error);
      // Fallback: try to extract table refs using regex if AST fails
      return this.extractTableRefsFromRegex(this.parser.getParsedInput() || '');
    }
  }

  /**
   * Fallback: Extract table references using regex
   * Used when AST traversal fails
   */
  private extractTableRefsFromRegex(sql: string): TableReference[] {
    const tables: TableReference[] = [];
    
    // Match: FROM table_name alias or FROM table_name AS alias
    // Also handles multi-line
    const fromPattern = /FROM\s+(\w+)(?:\s+AS\s+(\w+)|\s+(\w+))?/gis;
    
    let match;
    while ((match = fromPattern.exec(sql)) !== null) {
      const tableName = match[1];
      const alias = match[2] || match[3]; // AS alias or just alias
      
      if (tableName) {
        const tableRef: TableReference = {
          name: tableName,
        };
        if (alias) {
          tableRef.alias = alias;
        }
        tables.push(tableRef);
      }
    }
    
    // Match: JOIN table_name alias or JOIN table_name AS alias
    // Handles INNER JOIN, LEFT JOIN, RIGHT JOIN, etc.
    const joinPattern = /(?:INNER\s+|LEFT\s+|RIGHT\s+|FULL\s+|CROSS\s+)?JOIN\s+(\w+)(?:\s+AS\s+(\w+)|\s+(\w+))?/gis;
    
    while ((match = joinPattern.exec(sql)) !== null) {
      const tableName = match[1];
      const alias = match[2] || match[3];
      
      // Avoid duplicates
      if (tableName && !tables.find(t => t.name === tableName && t.alias === alias)) {
        const tableRef: TableReference = {
          name: tableName,
        };
        if (alias) {
          tableRef.alias = alias;
        }
        tables.push(tableRef);
      }
    }
    
    return tables;
  }

  /**
   * Extract alias mappings from table references
   *
   * @param tableRefs - Array of table references
   * @returns Alias map
   */
  extractAliases(tableRefs: TableReference[]): AliasMap {
    const aliases: AliasMap = {};

    for (const ref of tableRefs) {
      if (ref.alias) {
        aliases[ref.alias] = ref;
      }
      // Also map table name to itself
      aliases[ref.name] = ref;
    }

    return aliases;
  }

  /**
   * Validate SQL syntax
   *
   * @param sql - SQL string to validate
   * @returns Whether SQL is valid
   */
  validate(sql: string): boolean {
    const result = this.parse(sql);
    return result.success;
  }

  /**
   * Get suggestions for auto-fixing errors
   *
   * @param sql - SQL string with errors
   * @returns Array of suggestions
   */
  getSuggestions(sql: string): string[] {
    const suggestions: string[] = [];
    const result = this.parse(sql);

    for (const error of result.errors) {
      // Basic suggestions based on common errors
      if (error.message.includes('syntax error')) {
        suggestions.push('Check SQL syntax for typos or missing keywords');
      }
      if (error.message.includes('table') && error.message.includes('not found')) {
        suggestions.push('Verify table name and schema');
      }
      if (error.message.includes('column')) {
        suggestions.push('Check column name spelling');
      }
    }

    return suggestions;
  }

  /**
   * Get SQL suggestions at caret position
   *
   * @param sql - SQL string
   * @param caret - Caret position
   * @returns SQL suggestions
   */
  getSuggestionsAtCaretPosition(_sql: string, _caret: { lineNumber: number; column: number }): {
    keywords?: string[];
    tables?: string[];
    columns?: string[];
  } {
    try {
      // This would integrate with dt-sql-parser's suggestion system
      // For now, return basic structure
      return {
        keywords: ['SELECT', 'FROM', 'WHERE', 'JOIN', 'GROUP BY', 'ORDER BY'],
        tables: [],
        columns: [],
      };
    } catch (error) {
      this.logger.error('Error getting suggestions:', error);
      return {};
    }
  }

  /**
   * Traverse AST and apply callback to each node
   *
   * @param node - AST node
   * @param callback - Callback function
   * @param visited - Set of visited nodes to prevent circular references
   */
  private traverseAST(node: any, callback: (node: any) => void, visited: Set<any> = new Set()): void {
    if (!node || typeof node !== 'object') return;
    
    // Prevent circular references
    if (visited.has(node)) return;
    visited.add(node);

    callback(node);

    // Traverse arrays
    if (Array.isArray(node)) {
      for (const item of node) {
        this.traverseAST(item, callback, visited);
      }
      return;
    }

    // Traverse object properties (skip certain keys that cause circular refs)
    const skipKeys = new Set(['parent', 'parentCtx', 'invokingState', '_parent']);
    for (const key of Object.keys(node)) {
      if (skipKeys.has(key)) continue;
      
      const value = node[key];
      if (value && typeof value === 'object') {
        this.traverseAST(value, callback, visited);
      }
    }
  }
}