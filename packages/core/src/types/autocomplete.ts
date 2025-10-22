/**
 * Autocomplete-related types
 * @packageDocumentation
 */

import type { SQLContext } from './sql';
import type { SchemaRegistry } from '../schema/schema-registry';

/**
 * Completion item types
 */
export type CompletionType =
  | 'table'
  | 'column'
  | 'keyword'
  | 'function'
  | 'alias'
  | 'database'
  | 'snippet'
  | 'custom';

/**
 * Completion item
 */
export interface Completion {
  /** Display label */
  label: string;
  /** Completion type */
  type: CompletionType;
  /** Additional detail text */
  detail?: string;
  /** Documentation/description */
  documentation?: string;
  /** Text to insert (defaults to label) */
  insertText?: string;
  /** Sort priority (lower = higher priority) */
  sortPriority?: number;
  /** Filter text for matching (defaults to label) */
  filterText?: string;
  /** Fuzzy match score (set by autocomplete engine) */
  score?: number;
  /** Additional metadata */
  metadata?: Record<string, any>;
}

/**
 * Completion provider interface
 */
export interface CompletionProvider {
  /**
   * Check if this provider can provide completions for the given context
   * @param context - SQL context
   * @returns Whether provider can provide completions
   */
  canProvide(context: SQLContext): boolean;

  /**
   * Provide completions for the given context
   * @param context - SQL context
   * @param schema - Schema registry
   * @returns Array of completions
   */
  provide(context: SQLContext, schema: SchemaRegistry): Completion[];
}

/**
 * Autocomplete options
 */
export interface AutocompleteOptions {
  /** Whether autocomplete is enabled */
  enabled: boolean;
  /** Characters that trigger autocomplete */
  triggerCharacters: string[];
  /** Debounce delay in milliseconds */
  debounceMs: number;
  /** Maximum number of suggestions to show */
  maxSuggestions: number;
  /** Enable fuzzy matching */
  fuzzyMatch: boolean;
  /** Minimum characters before showing suggestions */
  minCharacters: number;
  /** Case-sensitive matching */
  caseSensitive: boolean;
}

/**
 * Default autocomplete options
 */
export const DEFAULT_AUTOCOMPLETE_OPTIONS: AutocompleteOptions = {
  enabled: true,
  triggerCharacters: ['.', ' '],
  debounceMs: 150,
  maxSuggestions: 50,
  fuzzyMatch: true,
  minCharacters: 0,
  caseSensitive: false,
};

