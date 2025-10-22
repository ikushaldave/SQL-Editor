/**
 * Autocomplete Engine
 * Main autocomplete service that coordinates providers and ranking
 * @packageDocumentation
 */

import type {
  Completion,
  CompletionProvider,
  AutocompleteOptions,
} from '../types/autocomplete';
import { DEFAULT_AUTOCOMPLETE_OPTIONS } from '../types/autocomplete';
import type { Position } from '../types/common';
import type { SchemaRegistry } from '../schema/schema-registry';
import { ParserService } from '../parser/parser-service';
import { detectContext } from '../parser/context-detector';
import { fuzzyMatch } from './fuzzy-matcher';
import { createLogger } from '../utils/logger';
import type { Logger } from '../types/plugin';

// Default providers
import {
  TableCompletionProvider,
  ColumnCompletionProvider,
  KeywordCompletionProvider,
  FunctionCompletionProvider,
} from './providers';

/**
 * Autocomplete Engine implementation
 *
 * @example
 * ```typescript
 * const engine = new AutocompleteEngine();
 * const schema = new SchemaRegistry();
 * 
 * schema.registerSchema({...});
 * 
 * const suggestions = engine.getSuggestions(
 *   'SELECT u. FROM users u',
 *   { line: 0, column: 9 },
 *   schema
 * );
 * ```
 */
export class AutocompleteEngine {
  private providers: CompletionProvider[] = [];
  private parser: ParserService;
  private logger: Logger;
  private options: AutocompleteOptions;

  constructor(options: Partial<AutocompleteOptions> = {}) {
    this.options = { ...DEFAULT_AUTOCOMPLETE_OPTIONS, ...options };
    this.parser = new ParserService();
    this.logger = createLogger('AutocompleteEngine');

    // Register default providers
    this.registerDefaultProviders();
  }

  /**
   * Get autocomplete suggestions for the given SQL and position
   *
   * @param sql - SQL string
   * @param position - Cursor position
   * @param schema - Schema registry
   * @returns Array of completions
   */
  getSuggestions(
    sql: string,
    position: Position,
    schema: SchemaRegistry
  ): Completion[] {
    if (!this.options.enabled) {
      return [];
    }

    try {
      // Parse SQL to get table references
      const parseResult = this.parser.parse(sql);
      
      // Detect context at position
      const context = detectContext(sql, position, parseResult.tableRefs);

      // Check minimum characters
      if (
        this.options.minCharacters > 0 &&
        context.currentToken.length < this.options.minCharacters &&
        !context.afterDot
      ) {
        return [];
      }

      // Collect suggestions from all providers
      const allCompletions: Completion[] = [];

      for (const provider of this.providers) {
        if (provider.canProvide(context)) {
          const suggestions = provider.provide(context, schema);
          allCompletions.push(...suggestions);
        }
      }

      // Filter and rank suggestions
      const filtered = this.filterAndRank(
        allCompletions,
        context.currentToken
      );

      // Limit results
      return filtered.slice(0, this.options.maxSuggestions);
    } catch (error) {
      this.logger.error('Error getting suggestions:', error);
      return [];
    }
  }

  /**
   * Register a custom completion provider
   *
   * @param provider - Completion provider to register
   */
  registerProvider(provider: CompletionProvider): void {
    this.providers.push(provider);
    this.logger.debug('Registered custom completion provider');
  }

  /**
   * Remove a completion provider
   *
   * @param provider - Provider to remove
   */
  removeProvider(provider: CompletionProvider): void {
    const index = this.providers.indexOf(provider);
    if (index !== -1) {
      this.providers.splice(index, 1);
      this.logger.debug('Removed completion provider');
    }
  }

  /**
   * Update autocomplete options
   *
   * @param options - New options (partial)
   */
  setOptions(options: Partial<AutocompleteOptions>): void {
    this.options = { ...this.options, ...options };
    this.logger.debug('Updated autocomplete options');
  }

  /**
   * Get current options
   *
   * @returns Current autocomplete options
   */
  getOptions(): AutocompleteOptions {
    return { ...this.options };
  }

  /**
   * Filter and rank completions based on query
   */
  private filterAndRank(
    completions: Completion[],
    query: string
  ): Completion[] {
    if (!query && !this.options.fuzzyMatch) {
      // No filtering needed, just sort by priority
      return this.sortByPriority(completions);
    }

    // Apply fuzzy matching if enabled
    if (this.options.fuzzyMatch && query) {
      const withScores = completions.map((completion) => {
        const filterText = completion.filterText || completion.label;
        const score = fuzzyMatch(
          query,
          filterText,
          this.options.caseSensitive
        );
        return { ...completion, score };
      });

      // Filter out non-matches
      const filtered = withScores.filter((c) => c.score > 0);

      // Sort by score and priority
      filtered.sort((a, b) => {
        // First by score
        if (b.score !== a.score) {
          return b.score - a.score;
        }
        // Then by priority
        const aPriority = a.sortPriority ?? 99;
        const bPriority = b.sortPriority ?? 99;
        return aPriority - bPriority;
      });

      return filtered;
    }

    // Simple prefix matching
    if (query) {
      const normalized = this.options.caseSensitive ? query : query.toLowerCase();
      const filtered = completions.filter((c) => {
        const label = this.options.caseSensitive
          ? c.label
          : c.label.toLowerCase();
        return label.startsWith(normalized);
      });
      return this.sortByPriority(filtered);
    }

    return this.sortByPriority(completions);
  }

  /**
   * Sort completions by priority
   */
  private sortByPriority(completions: Completion[]): Completion[] {
    return completions.sort((a, b) => {
      const aPriority = a.sortPriority ?? 99;
      const bPriority = b.sortPriority ?? 99;
      
      if (aPriority !== bPriority) {
        return aPriority - bPriority;
      }
      
      // Secondary sort by label
      return a.label.localeCompare(b.label);
    });
  }

  /**
   * Register default completion providers
   */
  private registerDefaultProviders(): void {
    this.providers = [
      new ColumnCompletionProvider(),
      new TableCompletionProvider(),
      new FunctionCompletionProvider(),
      new KeywordCompletionProvider(),
    ];
    this.logger.debug('Registered default completion providers');
  }
}

