/**
 * Validator Service
 * Validates SQL and provides error reporting
 * @packageDocumentation
 */

import type { Validator, ValidationResult } from '../types/validator';
import type { ValidationError } from '../types/sql';
import type { SchemaRegistry } from '../schema/schema-registry';
import { ParserService } from '../parser/parser-service';
import { createLogger } from '../utils/logger';
import type { Logger } from '../types/plugin';
import type { ValidationRuleConfig } from './rules/validation-rule';

/**
 * Main validator service
 *
 * @example
 * ```typescript
 * const validator = new ValidatorService();
 * const schema = new SchemaRegistry();
 * 
 * const result = validator.validate('SELECT * FROM users', schema);
 * if (!result.valid) {
 *   console.error('Errors:', result.errors);
 * }
 * ```
 */
export class ValidatorService {
  private validators: Validator[] = [];
  private validationRules: ValidationRuleConfig[] = [];
  private parser: ParserService;
  private logger: Logger;

  constructor() {
    this.parser = new ParserService();
    this.logger = createLogger('ValidatorService');
  }

  /**
   * Validate SQL
   *
   * @param sql - SQL string to validate
   * @param schema - Schema registry
   * @returns Validation result
   */
  validate(sql: string, schema: SchemaRegistry): ValidationResult {
    const errors: ValidationError[] = [];

    try {
      // Parse SQL first (syntax validation)
      const parseResult = this.parser.parse(sql);

      // Add parse errors
      errors.push(
        ...parseResult.errors.map((e) => ({
          ...e,
          type: 'syntax' as const,
        }))
      );

      // Run custom validators
      for (const validator of this.validators) {
        const validationErrors = validator.validate(
          sql,
          parseResult.ast,
          schema
        );
        errors.push(...validationErrors);
      }

      // Run validation rules
      for (const ruleConfig of this.validationRules) {
        if (!ruleConfig.enabled) continue;

        try {
          const ruleErrors = ruleConfig.rule.validate(sql, errors, schema);
          
          // Mark new errors with rule type
          const errorCountBefore = errors.length;
          errors.push(...ruleErrors);
          
          // Set rule type for newly added errors
          for (let i = errorCountBefore; i < errors.length; i++) {
            if (!errors[i]!.type) {
              errors[i]!.type = 'custom';
            }
          }
        } catch (error) {
          this.logger.error(`Error in validation rule ${ruleConfig.rule.name}:`, error);
        }
      }

      return {
        valid: errors.length === 0,
        errors,
      };
    } catch (error) {
      this.logger.error('Validation error:', error);
      return {
        valid: false,
        errors: [
          {
            message:
              error instanceof Error ? error.message : 'Unknown validation error',
            severity: 'error',
            type: 'syntax',
          },
        ],
      };
    }
  }

  /**
   * Register a custom validator
   *
   * @param validator - Validator to register
   */
  registerValidator(validator: Validator): void {
    this.validators.push(validator);
    this.logger.debug(`Registered validator: ${validator.name}`);
  }

  /**
   * Remove a validator
   *
   * @param validator - Validator to remove
   */
  removeValidator(validator: Validator): void {
    const index = this.validators.indexOf(validator);
    if (index !== -1) {
      this.validators.splice(index, 1);
      this.logger.debug(`Removed validator: ${validator.name}`);
    }
  }

  /**
   * Add a validation rule
   *
   * @param ruleConfig - Validation rule configuration
   */
  addRule(ruleConfig: ValidationRuleConfig): void {
    this.validationRules.push(ruleConfig);
    this.logger.debug(`Added validation rule: ${ruleConfig.rule.name}`);
  }

  /**
   * Remove a validation rule
   *
   * @param ruleName - Name of rule to remove
   */
  removeRule(ruleName: string): void {
    this.validationRules = this.validationRules.filter(
      rule => rule.rule.name !== ruleName
    );
    this.logger.debug(`Removed validation rule: ${ruleName}`);
  }

  /**
   * Set validation rules
   *
   * @param rules - Array of validation rule configurations
   */
  setRules(rules: ValidationRuleConfig[]): void {
    this.validationRules = rules;
    this.logger.debug(`Set ${rules.length} validation rules`);
  }

  /**
   * Get all validation rules
   *
   * @returns Array of validation rule configurations
   */
  getRules(): ValidationRuleConfig[] {
    return [...this.validationRules];
  }
}

