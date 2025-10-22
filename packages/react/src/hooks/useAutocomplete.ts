/**
 * Autocomplete hook
 * @packageDocumentation
 */

import { useState, useCallback } from 'react';
import type { Completion, SchemaRegistry, AutocompleteEngine } from '@sql-editor/core';
import type { UseAutocompleteReturn } from '../types/hooks';

/**
 * Autocomplete hook
 *
 * @param options - Hook options
 * @returns Autocomplete state and methods
 *
 * @example
 * ```tsx
 * const { suggestions, getSuggestions, visible, show, hide } = useAutocomplete({
 *   engine: autocompleteEngine,
 *   schema: schemaRegistry
 * });
 * ```
 */
export function useAutocomplete(options: {
  engine: AutocompleteEngine;
  schema: SchemaRegistry;
}): UseAutocompleteReturn {
  const [suggestions, setSuggestions] = useState<Completion[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [visible, setVisible] = useState(false);

  const getSuggestions = useCallback(
    (sql: string, line: number, column: number): Completion[] => {
      const completions = options.engine.getSuggestions(
        sql,
        { line, column },
        options.schema
      );
      setSuggestions(completions);
      setSelectedIndex(0);
      return completions;
    },
    [options.engine, options.schema]
  );

  const selectSuggestion = useCallback((index: number) => {
    setSelectedIndex(index);
  }, []);

  const show = useCallback(() => {
    setVisible(true);
  }, []);

  const hide = useCallback(() => {
    setVisible(false);
    setSuggestions([]);
    setSelectedIndex(0);
  }, []);

  return {
    suggestions,
    getSuggestions,
    selectedIndex,
    selectSuggestion,
    visible,
    show,
    hide,
  };
}

