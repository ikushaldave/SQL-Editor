/**
 * SQL Editor React
 * React components for SQL editing with intelligent autocomplete
 * @packageDocumentation
 */

// Re-export core types
export type {
  SchemaDefinition,
  TableDefinition,
  ColumnDefinition,
  DatabaseDefinition,
  Completion,
  CompletionProvider,
  CompletionType,
  SQLDialect,
  AutocompleteOptions,
  ValidationOptions,
  ValidationError,
  Validator,
} from '@sql-editor/core';

// Export components
export { SQLEditor } from './components/SQLEditor';
export { CompletionPopup } from './components/CompletionPopup';

// Export hooks
export { useSQLEditor } from './hooks/useSQLEditor';
export { useAutocomplete } from './hooks/useAutocomplete';
export { useValidation } from './hooks/useValidation';

// Export types
export type { SQLEditorProps, CompletionPopupProps } from './types/props';
export type {
  UseSQLEditorReturn,
  UseAutocompleteReturn,
  UseValidationReturn,
} from './types/hooks';

