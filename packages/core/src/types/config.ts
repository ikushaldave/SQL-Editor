/**
 * Configuration types
 * @packageDocumentation
 */

import type { SQLDialect } from './common';
import type { AutocompleteOptions } from './autocomplete';

/**
 * Validation options
 */
export interface ValidationOptions {
  /** Whether validation is enabled */
  enabled: boolean;
  /** Debounce delay in milliseconds */
  debounceMs: number;
  /** Validate on every change */
  validateOnChange: boolean;
  /** Validate schema references */
  validateSchema: boolean;
}

/**
 * Default validation options
 */
export const DEFAULT_VALIDATION_OPTIONS: ValidationOptions = {
  enabled: true,
  debounceMs: 300,
  validateOnChange: true,
  validateSchema: true,
};

/**
 * Schema options
 */
export interface SchemaOptions {
  /** Lazy load schema data */
  lazyLoad: boolean;
  /** Case-sensitive schema matching */
  caseSensitive: boolean;
  /** Cache schema lookups */
  enableCache: boolean;
  /** Cache TTL in milliseconds */
  cacheTTL: number;
}

/**
 * Default schema options
 */
export const DEFAULT_SCHEMA_OPTIONS: SchemaOptions = {
  lazyLoad: true,
  caseSensitive: false,
  enableCache: true,
  cacheTTL: 5 * 60 * 1000, // 5 minutes
};

/**
 * SQL Editor configuration
 */
export interface SQLEditorConfig {
  /** SQL dialect */
  dialect: SQLDialect;
  /** Autocomplete options */
  autocomplete: AutocompleteOptions;
  /** Validation options */
  validation: ValidationOptions;
  /** Schema options */
  schema: SchemaOptions;
}

