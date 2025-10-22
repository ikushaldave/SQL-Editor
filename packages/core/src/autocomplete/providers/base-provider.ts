/**
 * Base completion provider
 * @packageDocumentation
 */

import type { CompletionProvider } from '../../types/autocomplete';

/**
 * Abstract base class for completion providers
 */
export abstract class BaseCompletionProvider implements CompletionProvider {
  abstract canProvide(context: any): boolean;
  abstract provide(context: any, schema: any): any[];
}

