/**
 * Main SQL Editor hook
 * @packageDocumentation
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import {
  SchemaRegistry,
  AutocompleteEngine,
  ValidatorService,
  type SchemaDefinition,
  type ValidationError,
  type AutocompleteOptions,
  type ValidationOptions,
  type CompletionProvider,
  type Validator,
  DEFAULT_AUTOCOMPLETE_OPTIONS,
  DEFAULT_VALIDATION_OPTIONS,
} from '@sql-editor/core';
import type { UseSQLEditorReturn } from '../types/hooks';

/**
 * Main SQL Editor hook
 *
 * @param options - Hook options
 * @returns SQL Editor state and methods
 *
 * @example
 * ```tsx
 * const { value, onChange, errors, validate } = useSQLEditor({
 *   initialValue: 'SELECT * FROM users',
 *   schema: mySchema
 * });
 * ```
 */
export function useSQLEditor(options: {
  initialValue?: string;
  schema?: SchemaDefinition;
  autocompleteOptions?: Partial<AutocompleteOptions>;
  validationOptions?: Partial<ValidationOptions>;
  completionProviders?: CompletionProvider[];
  validators?: Validator[];
  parserOptions?: {
    embeddedVariables?: boolean;
  };
}): UseSQLEditorReturn {
  const [value, setValue] = useState(options.initialValue || '');
  const [errors, setErrors] = useState<ValidationError[]>([]);

  // Create service instances (once)
  const schemaRef = useRef<SchemaRegistry>(new SchemaRegistry());
  const autocompleteRef = useRef<AutocompleteEngine>(
    new AutocompleteEngine({
      ...DEFAULT_AUTOCOMPLETE_OPTIONS,
      ...options.autocompleteOptions,
    })
  );
  const validatorRef = useRef<ValidatorService>(new ValidatorService());

  // Register schema when it changes
  useEffect(() => {
    if (options.schema) {
      schemaRef.current.registerSchema(options.schema);
    }
  }, [options.schema]);

  // Register custom providers when they change
  useEffect(() => {
    if (options.completionProviders) {
      for (const provider of options.completionProviders) {
        autocompleteRef.current.registerProvider(provider);
      }
    }
  }, [options.completionProviders]);

  // Register custom validators when they change
  useEffect(() => {
    if (options.validators) {
      for (const validator of options.validators) {
        validatorRef.current.registerValidator(validator);
      }
    }
  }, [options.validators]);

  // Validation function
  const validate = useCallback(() => {
    const result = validatorRef.current.validate(value, schemaRef.current);
    setErrors(result.errors);
  }, [value]);

  // Auto-validate on value change (if enabled)
  useEffect(() => {
    const validationEnabled = options.validationOptions?.enabled ?? DEFAULT_VALIDATION_OPTIONS.enabled;
    const shouldValidate =
      validationEnabled &&
      (options.validationOptions?.validateOnChange ?? DEFAULT_VALIDATION_OPTIONS.validateOnChange);

    if (!validationEnabled) {
      // Clear errors when validation is explicitly disabled
      setErrors([]);
      return undefined;
    }

    if (shouldValidate) {
      const timeoutId = setTimeout(() => {
        // Call validate directly inline to avoid dependency issues
        const result = validatorRef.current.validate(value, schemaRef.current);
        setErrors(result.errors);
      }, options.validationOptions?.debounceMs ?? DEFAULT_VALIDATION_OPTIONS.debounceMs);

      return () => clearTimeout(timeoutId);
    }
    
    return undefined;
  }, [value, options.validationOptions]);

  const onChange = (newValue: string) => {
    setValue(newValue);
  };

  return {
    value,
    onChange,
    errors,
    validate,
    schema: schemaRef.current,
    autocomplete: autocompleteRef.current,
    validator: validatorRef.current,
  };
}

