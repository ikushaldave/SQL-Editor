/**
 * React hook types
 * @packageDocumentation
 */

import type {
  Completion,
  ValidationError,
  SchemaRegistry,
  AutocompleteEngine,
  ValidatorService,
} from '@sql-editor/core';

/**
 * SQL Editor hook return type
 */
export interface UseSQLEditorReturn {
  /** Current SQL value */
  value: string;

  /** Change handler */
  onChange: (value: string) => void;

  /** Validation errors */
  errors: ValidationError[];

  /** Validate SQL */
  validate: () => void;

  /** Schema registry instance */
  schema: SchemaRegistry;

  /** Autocomplete engine instance */
  autocomplete: AutocompleteEngine;

  /** Validator service instance */
  validator: ValidatorService;
}

/**
 * Autocomplete hook return type
 */
export interface UseAutocompleteReturn {
  /** Current suggestions */
  suggestions: Completion[];

  /** Get suggestions for position */
  getSuggestions: (sql: string, line: number, column: number) => Completion[];

  /** Selected suggestion index */
  selectedIndex: number;

  /** Select suggestion */
  selectSuggestion: (index: number) => void;

  /** Autocomplete visible */
  visible: boolean;

  /** Show autocomplete */
  show: () => void;

  /** Hide autocomplete */
  hide: () => void;
}

/**
 * Validation hook return type
 */
export interface UseValidationReturn {
  /** Current errors */
  errors: ValidationError[];

  /** Validate SQL */
  validate: (sql: string) => void;

  /** Clear errors */
  clearErrors: () => void;

  /** Is validating */
  isValidating: boolean;
}

