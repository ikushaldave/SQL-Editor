/**
 * Variable Handler
 * Handles embedded variables like $(variable) in SQL
 * @packageDocumentation
 */

/**
 * Variable mapping for position tracking
 */
export interface VariableMap {
  [placeholder: string]: string;
}

/**
 * Result of variable escaping
 */
export interface EscapedResult {
  escapedSql: string;
  variableMap: VariableMap;
}

/**
 * Handles embedded variables in SQL queries
 * 
 * @example
 * ```typescript
 * const handler = new VariableHandler();
 * const result = handler.escapeVariables('SELECT * FROM $(table) WHERE id = $(id)');
 * // result.escapedSql = 'SELECT * FROM "${placeholder}" WHERE id = "${placeholder}"'
 * // result.variableMap = { '${placeholder}': '$(table)', '${placeholder}': '$(id)' }
 * ```
 */
export class VariableHandler {
  private static readonly PLACEHOLDER = '${placeholder}';
  private static readonly VARIABLE_PATTERN = /\$\(([^)]+)\)/g;

  /**
   * Escape variables in SQL string
   */
  escapeVariables(sql: string): EscapedResult {
    const variableMap: VariableMap = {};
    let placeholderCounter = 0;

    const escapedSql = sql.replace(VariableHandler.VARIABLE_PATTERN, (match, _variableName) => {
      const placeholder = `${VariableHandler.PLACEHOLDER}_${placeholderCounter++}`;
      variableMap[placeholder] = match;
      return placeholder;
    });

    return { escapedSql, variableMap };
  }

  /**
   * Revert escaped SQL back to original
   */
  revertEscapedSql(escapedSql: string, variableMap: VariableMap): string {
    let revertedSql = escapedSql;
    
    for (const [placeholder, originalVariable] of Object.entries(variableMap)) {
      revertedSql = revertedSql.replace(new RegExp(placeholder.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), originalVariable);
    }

    return revertedSql;
  }

  /**
   * Adjust error positions from escaped SQL back to original SQL
   */
  revertErrorPositions(
    errors: Array<{ startLine?: number; startColumn?: number; endLine?: number; endColumn?: number; [key: string]: any }>,
    originalSql: string,
    escapedSql: string,
    variableMap: VariableMap
  ): Array<{ startLine?: number; startColumn?: number; endLine?: number; endColumn?: number; [key: string]: any }> {
    return errors.map(error => {
      const adjustedError = { ...error };

      // Adjust column positions based on variable length differences
      if (error.startColumn !== undefined || error.endColumn !== undefined) {
        const line = error.startLine || 0;
        const originalLine = originalSql.split('\n')[line] || '';
        const escapedLine = escapedSql.split('\n')[line] || '';

        if (error.startColumn !== undefined) {
          adjustedError.startColumn = this.adjustColumnPosition(
            error.startColumn,
            originalLine,
            escapedLine,
            variableMap
          );
        }

        if (error.endColumn !== undefined) {
          adjustedError.endColumn = this.adjustColumnPosition(
            error.endColumn,
            originalLine,
            escapedLine,
            variableMap
          );
        }
      }

      return adjustedError;
    });
  }

  /**
   * Adjust a single column position
   */
  private adjustColumnPosition(
    column: number,
    _originalLine: string,
    escapedLine: string,
    variableMap: VariableMap
  ): number {
    let adjustedColumn = column;

    // Find all variable positions in the escaped line
    const variablePositions: Array<{ start: number; end: number; originalLength: number }> = [];
    
    for (const [placeholder, originalVariable] of Object.entries(variableMap)) {
      let searchPos = 0;
      while (true) {
        const pos = escapedLine.indexOf(placeholder, searchPos);
        if (pos === -1) break;
        
        variablePositions.push({
          start: pos,
          end: pos + placeholder.length,
          originalLength: originalVariable.length
        });
        
        searchPos = pos + 1;
      }
    }

    // Sort by position
    variablePositions.sort((a, b) => a.start - b.start);

    // Adjust column position based on variable length differences
    for (const variable of variablePositions) {
      if (column > variable.start) {
        const lengthDiff = variable.originalLength - (variable.end - variable.start);
        adjustedColumn += lengthDiff;
      }
    }

    return adjustedColumn;
  }

  /**
   * Check if SQL contains variables
   */
  hasVariables(sql: string): boolean {
    return VariableHandler.VARIABLE_PATTERN.test(sql);
  }

  /**
   * Extract all variables from SQL
   */
  extractVariables(sql: string): string[] {
    const variables: string[] = [];
    let match;
    
    // Reset regex lastIndex
    VariableHandler.VARIABLE_PATTERN.lastIndex = 0;
    
    while ((match = VariableHandler.VARIABLE_PATTERN.exec(sql)) !== null) {
      if (match[1]) {
        variables.push(match[1]);
      }
    }
    
    return variables;
  }
}
