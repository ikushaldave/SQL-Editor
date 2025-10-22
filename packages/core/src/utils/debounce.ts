/**
 * Debounce utility
 * @packageDocumentation
 */

/**
 * Creates a debounced function that delays invoking func until after wait milliseconds
 * have elapsed since the last time the debounced function was invoked.
 *
 * @param func - The function to debounce
 * @param wait - The number of milliseconds to delay
 * @returns The debounced function
 *
 * @example
 * ```typescript
 * const debouncedSave = debounce((value: string) => {
 *   save(value);
 * }, 300);
 *
 * debouncedSave('hello'); // Will only call save() once after 300ms
 * debouncedSave('world');
 * ```
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;

  return function debounced(...args: Parameters<T>) {
    if (timeout) {
      clearTimeout(timeout);
    }

    timeout = setTimeout(() => {
      func(...args);
      timeout = null;
    }, wait);
  };
}

/**
 * Creates a debounced function that also returns a promise
 *
 * @param func - The function to debounce
 * @param wait - The number of milliseconds to delay
 * @returns The debounced function that returns a promise
 *
 * @example
 * ```typescript
 * const debouncedFetch = debounceAsync(async (query: string) => {
 *   return await fetch(query);
 * }, 300);
 *
 * const result = await debouncedFetch('search');
 * ```
 */
export function debounceAsync<T extends (...args: any[]) => Promise<any>>(
  func: T,
  wait: number
): (...args: Parameters<T>) => Promise<ReturnType<T>> {
  let timeout: NodeJS.Timeout | null = null;
  let pending: {
    resolve: (value: any) => void;
    reject: (error: any) => void;
  }[] = [];

  return function debounced(...args: Parameters<T>): Promise<ReturnType<T>> {
    return new Promise((resolve, reject) => {
      if (timeout) {
        clearTimeout(timeout);
      }

      pending.push({ resolve, reject });

      timeout = setTimeout(async () => {
        const currentPending = pending;
        pending = [];
        timeout = null;

        try {
          const result = await func(...args);
          currentPending.forEach((p) => p.resolve(result));
        } catch (error) {
          currentPending.forEach((p) => p.reject(error));
        }
      }, wait);
    });
  };
}

