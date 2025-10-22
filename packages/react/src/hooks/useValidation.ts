/**
 * Validation hook
 * @packageDocumentation
 */

import { useState, useCallback } from 'react';
import type { ValidationError, ValidatorService, SchemaRegistry } from '@sql-editor/core';
import type { UseValidationReturn } from '../types/hooks';

/**
 * Validation hook
 *
 * @param options - Hook options
 * @returns Validation state and methods
 *
 * @example
 * ```tsx
 * const { errors, validate, clearErrors } = useValidation({
 *   validator: validatorService,
 *   schema: schemaRegistry
 * });
 * ```
 */
export function useValidation(options: {
  validator: ValidatorService;
  schema: SchemaRegistry;
}): UseValidationReturn {
  const [errors, setErrors] = useState<ValidationError[]>([]);
  const [isValidating, setIsValidating] = useState(false);

  const validate = useCallback(
    (sql: string) => {
      setIsValidating(true);
      try {
        const result = options.validator.validate(sql, options.schema);
        setErrors(result.errors);
      } finally {
        setIsValidating(false);
      }
    },
    [options.validator, options.schema]
  );

  const clearErrors = useCallback(() => {
    setErrors([]);
  }, []);

  return {
    errors,
    validate,
    clearErrors,
    isValidating,
  };
}

