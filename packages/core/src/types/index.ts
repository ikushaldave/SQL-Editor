/**
 * Type definitions for SQL Editor Core
 * @packageDocumentation
 */

// Common types
export type {
  Position,
  Range,
  SQLDialect,
  LogLevel,
  Result,
} from './common';

// SQL types
export type {
  SQLContextType,
  SQLContext,
  TableReference,
  AliasMap,
  ParseResult,
  ParseError,
  ValidationError,
} from './sql';

// Schema types
export type {
  ColumnType,
  ColumnDefinition,
  TableDefinition,
  ForeignKeyDefinition,
  IndexDefinition,
  DatabaseDefinition,
  SchemaDefinition,
  SchemaItem,
} from './schema';

// Autocomplete types
export type {
  CompletionType,
  Completion,
  CompletionProvider,
  AutocompleteOptions,
} from './autocomplete';

export { DEFAULT_AUTOCOMPLETE_OPTIONS } from './autocomplete';

// Config types
export type {
  ValidationOptions,
  SchemaOptions,
  SQLEditorConfig,
} from './config';

export {
  DEFAULT_VALIDATION_OPTIONS,
  DEFAULT_SCHEMA_OPTIONS,
} from './config';

// Plugin types
export type {
  Plugin,
  PluginContext,
  Command,
  KeyBinding,
  Logger,
} from './plugin';

// Validator types
export type {
  Validator,
  ValidationResult,
} from './validator';

