/**
 * Utility functions
 * @packageDocumentation
 */

export { debounce, debounceAsync } from './debounce';
export { memoize, memoizeAsync } from './memoize';
export {
  positionEquals,
  positionCompare,
  positionBefore,
  positionAfter,
  positionInRange,
  positionToOffset,
  offsetToPosition,
  createRange,
  rangesOverlap,
} from './position';
export { SimpleLogger, createLogger } from './logger';

