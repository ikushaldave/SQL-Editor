/**
 * SQL Editor Core
 * Framework-agnostic SQL editor with intelligent autocomplete
 * @packageDocumentation
 */

// Export types
export * from './types';

// Export services
export { ParserService, detectContext, resolveAlias, VariableHandler } from './parser';
export { SchemaRegistry } from './schema';
export { AutocompleteEngine, fuzzyMatch, fuzzySort } from './autocomplete';
export { ValidatorService } from './validator';
export type { 
  ValidationRule, 
  ValidationRuleConfig, 
} from './validator/rules';
export { 
  BaseValidationRule,
  SchemaValidationRule,
  NamingConventionRule,
  PerformanceValidationRule 
} from './validator/rules';

// Export providers
export {
  BaseCompletionProvider,
  TableCompletionProvider,
  ColumnCompletionProvider,
  KeywordCompletionProvider,
  FunctionCompletionProvider,
} from './autocomplete/providers';

// Export utilities
export {
  debounce,
  debounceAsync,
  memoize,
  memoizeAsync,
  positionEquals,
  positionCompare,
  positionBefore,
  positionAfter,
  positionInRange,
  positionToOffset,
  offsetToPosition,
  createRange,
  rangesOverlap,
  createLogger,
} from './utils';

