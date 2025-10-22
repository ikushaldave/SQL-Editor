/**
 * Validation Rule System
 * @packageDocumentation
 */

import type { ValidationError } from '../../types/sql';
import type { SchemaRegistry } from '../../schema/schema-registry';

/**
 * Validation rule interface
 */
export interface ValidationRule {
  /** Rule name */
  name: string;
  /** Rule description */
  description?: string;
  /** Validate SQL and return errors */
  validate(
    sql: string,
    existingErrors: ValidationError[],
    schema?: SchemaRegistry
  ): ValidationError[];
}

/**
 * Validation rule configuration
 */
export interface ValidationRuleConfig {
  /** Rule instance */
  rule: ValidationRule;
  /** Rule type/severity */
  type?: 'error' | 'warning' | 'info';
  /** Whether rule is enabled */
  enabled?: boolean;
  /** Rule-specific options */
  options?: Record<string, any>;
}

/**
 * Base validation rule class
 */
export abstract class BaseValidationRule implements ValidationRule {
  abstract name: string;
  abstract description?: string;

  abstract validate(
    sql: string,
    existingErrors: ValidationError[],
    schema?: SchemaRegistry
  ): ValidationError[];

  /**
   * Create a validation error
   */
  protected createError(
    message: string,
    startLine?: number,
    startColumn?: number,
    endLine?: number,
    endColumn?: number,
    type: 'syntax' | 'semantic' | 'custom' = 'custom'
  ): ValidationError {
    const error: ValidationError = {
      message,
      severity: 'error',
      type,
    };

    if (startLine !== undefined) {
      error.location = {
        start: { line: startLine, column: startColumn || 0 },
        end: { line: endLine || startLine, column: endColumn || startColumn || 0 },
      };
    }

    return error;
  }
}

/**
 * Schema validation rule - checks for undefined tables/columns
 */
export class SchemaValidationRule extends BaseValidationRule {
  name = 'schema-validation';
  description = 'Validates that referenced tables and columns exist in the schema';

  validate(
    sql: string,
    _existingErrors: ValidationError[],
    schema?: SchemaRegistry
  ): ValidationError[] {
    const errors: ValidationError[] = [];

    if (!schema) {
      return errors; // No schema provided, skip validation
    }

    // This is a simplified implementation
    // In a real implementation, you'd parse the SQL and check each table/column reference
    const tablePattern = /FROM\s+(\w+)/gi;

    let match;
    
    // Check table references
    while ((match = tablePattern.exec(sql)) !== null) {
      const tableName = match[1];
      if (tableName && !schema.getTable(tableName)) {
        errors.push(this.createError(
          `Table '${tableName}' does not exist in schema`,
          undefined, undefined, undefined, undefined,
          'semantic'
        ));
      }
    }

    return errors;
  }
}

/**
 * Naming convention validation rule
 */
export class NamingConventionRule extends BaseValidationRule {
  name = 'naming-convention';
  description = 'Validates naming conventions for tables and columns';

  validate(
    sql: string,
    _existingErrors: ValidationError[],
    _schema?: SchemaRegistry
  ): ValidationError[] {
    const errors: ValidationError[] = [];

    // Example: Check for snake_case naming
    const snakeCasePattern = /[a-z]+(_[a-z]+)*/;
    
    // This is a simplified example
    // In practice, you'd parse the SQL and check each identifier
    if (!snakeCasePattern.test(sql)) {
      errors.push(this.createError(
        'Table and column names should follow snake_case convention',
        undefined, undefined, undefined, undefined,
        'custom'
      ));
    }

    return errors;
  }
}

/**
 * Performance validation rule
 */
export class PerformanceValidationRule extends BaseValidationRule {
  name = 'performance-validation';
  description = 'Validates SQL for potential performance issues';

  validate(
    sql: string,
    _existingErrors: ValidationError[],
    _schema?: SchemaRegistry
  ): ValidationError[] {
    const errors: ValidationError[] = [];

    // Check for SELECT * without LIMIT
    if (sql.includes('SELECT *') && !sql.includes('LIMIT')) {
      errors.push(this.createError(
        'Consider using LIMIT with SELECT * to avoid performance issues',
        undefined, undefined, undefined, undefined,
        'custom'
      ));
    }

    // Check for missing WHERE clause on large tables
    if (sql.includes('FROM') && !sql.includes('WHERE') && !sql.includes('LIMIT')) {
      errors.push(this.createError(
        'Consider adding WHERE clause or LIMIT to avoid scanning entire table',
        undefined, undefined, undefined, undefined,
        'custom'
      ));
    }

    return errors;
  }
}
