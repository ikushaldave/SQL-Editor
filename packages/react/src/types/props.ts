/**
 * React component prop types
 * @packageDocumentation
 */

import type {
  SchemaDefinition,
  SQLDialect,
  AutocompleteOptions,
  ValidationOptions,
  CompletionProvider,
  Validator,
} from '@sql-editor/core';

/**
 * SQL Editor component props
 */
export interface SQLEditorProps {
  /** SQL content */
  value: string;

  /** Change handler */
  onChange: (value: string) => void;

  /** Database schema */
  schema?: SchemaDefinition;

  /** SQL dialect */
  dialect?: SQLDialect;

  /** Editor height */
  height?: string;

  /** Editor width */
  width?: string;

  /** Ace theme */
  theme?: string;

  /** Autocomplete options */
  autocomplete?: Partial<AutocompleteOptions>;

  /** Validation options */
  validation?: Partial<ValidationOptions>;

  /** Custom completion providers */
  completionProviders?: CompletionProvider[];

  /** Custom validators */
  validators?: Validator[];

  /** Parser options */
  parserOptions?: {
    /** Enable embedded variables like $(variable) */
    embeddedVariables?: boolean;
  };

  /** Read-only mode */
  readOnly?: boolean;

  /** Show line numbers */
  showLineNumbers?: boolean;

  /** Font size */
  fontSize?: number;

  /** Tab size */
  tabSize?: number;

  /** Enable code folding */
  enableCodeFolding?: boolean;

  /** Additional CSS class name */
  className?: string;

  /** Placeholder text */
  placeholder?: string;

  /** On blur event */
  onBlur?: () => void;

  /** On focus event */
  onFocus?: () => void;
}

/**
 * Completion popup props
 */
export interface CompletionPopupProps {
  /** Completion items */
  items: Array<{
    label: string;
    type: string;
    detail?: string;
    documentation?: string;
  }>;

  /** Selected index */
  selectedIndex: number;

  /** Position */
  position: {
    top: number;
    left: number;
  };

  /** On select callback */
  onSelect: (index: number) => void;

  /** On close callback */
  onClose: () => void;

  /** Visible */
  visible: boolean;
}

