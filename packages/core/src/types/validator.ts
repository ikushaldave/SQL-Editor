/**
 * Validator types
 * @packageDocumentation
 */

import type { ValidationError } from './sql';
import type { SchemaRegistry } from '../schema/schema-registry';

/**
 * Validator interface
 */
export interface Validator {
  /**
   * Validator name
   */
  name: string;

  /**
   * Validate SQL
   * @param sql - SQL string to validate
   * @param ast - Parsed AST (if available)
   * @param schema - Schema registry
   * @returns Array of validation errors
   */
  validate(
    sql: string,
    ast: any | undefined,
    schema: SchemaRegistry
  ): ValidationError[];
}

/**
 * Validation result
 */
export interface ValidationResult {
  /** Whether validation passed */
  valid: boolean;
  /** Validation errors */
  errors: ValidationError[];
}

