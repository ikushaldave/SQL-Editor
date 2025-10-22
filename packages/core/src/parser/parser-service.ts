/**
 * Parser Service
 * Wraps dt-sql-parser with enhanced functionality including variable support
 * @packageDocumentation
 */

import { MySQL } from 'dt-sql-parser';
import type { ParseResult, TableReference, AliasMap } from '../types/sql';
import { createLogger } from '../utils/logger';
import type { Logger } from '../types/plugin';
import { VariableHandler } from './variable-handler';

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
  private parser: MySQL;
  private logger: Logger;
  private variableHandler: VariableHandler;
  private embeddedVariables: boolean = false;

  constructor() {
    this.logger = createLogger('ParserService');
    this.variableHandler = new VariableHandler();
    
    // Initialize parser - dt-sql-parser 4.3.1 uses MySQL
    this.parser = new MySQL();
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

      // Extract table references and aliases if parsing succeeded
      if (result.success && ast) {
        result.tableRefs = this.extractTableRefs(ast);
        result.aliases = this.extractAliases(result.tableRefs);
      }

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

      // Extract FROM clause tables
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
      return tables;
    }
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
   */
  private traverseAST(node: any, callback: (node: any) => void): void {
    if (!node || typeof node !== 'object') return;

    callback(node);

    // Traverse arrays
    if (Array.isArray(node)) {
      for (const item of node) {
        this.traverseAST(item, callback);
      }
      return;
    }

    // Traverse object properties
    for (const key of Object.keys(node)) {
      const value = node[key];
      if (value && typeof value === 'object') {
        this.traverseAST(value, callback);
      }
    }
  }
}