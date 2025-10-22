/**
 * Memoization utility
 * @packageDocumentation
 */

/**
 * Creates a memoized version of a function
 *
 * @param func - The function to memoize
 * @param keyGenerator - Optional function to generate cache key from arguments
 * @returns The memoized function
 *
 * @example
 * ```typescript
 * const expensiveCalc = memoize((a: number, b: number) => {
 *   return a * b;
 * });
 *
 * expensiveCalc(5, 10); // Calculates
 * expensiveCalc(5, 10); // Returns cached result
 * ```
 */
export function memoize<T extends (...args: any[]) => any>(
  func: T,
  keyGenerator?: (...args: Parameters<T>) => string
): T & { cache: Map<string, ReturnType<T>>; clear: () => void } {
  const cache = new Map<string, ReturnType<T>>();

  const defaultKeyGenerator = (...args: Parameters<T>): string => {
    return JSON.stringify(args);
  };

  const getKey = keyGenerator || defaultKeyGenerator;

  const memoized = function (...args: Parameters<T>): ReturnType<T> {
    const key = getKey(...args);

    if (cache.has(key)) {
      return cache.get(key)!;
    }

    const result = func(...args);
    cache.set(key, result);
    return result;
  } as T & { cache: Map<string, ReturnType<T>>; clear: () => void };

  memoized.cache = cache;
  memoized.clear = () => cache.clear();

  return memoized;
}

/**
 * Creates a memoized version of an async function with TTL support
 *
 * @param func - The async function to memoize
 * @param ttl - Time to live in milliseconds
 * @param keyGenerator - Optional function to generate cache key from arguments
 * @returns The memoized function
 *
 * @example
 * ```typescript
 * const fetchUser = memoizeAsync(
 *   async (id: string) => await api.getUser(id),
 *   60000 // Cache for 1 minute
 * );
 * ```
 */
export function memoizeAsync<T extends (...args: any[]) => Promise<any>>(
  func: T,
  ttl: number = Infinity,
  keyGenerator?: (...args: Parameters<T>) => string
): T & { cache: Map<string, CacheEntry<Awaited<ReturnType<T>>>>; clear: () => void } {
  const cache = new Map<string, CacheEntry<Awaited<ReturnType<T>>>>();

  const defaultKeyGenerator = (...args: Parameters<T>): string => {
    return JSON.stringify(args);
  };

  const getKey = keyGenerator || defaultKeyGenerator;

  const memoized = async function (...args: Parameters<T>): Promise<Awaited<ReturnType<T>>> {
    const key = getKey(...args);
    const now = Date.now();

    const cached = cache.get(key);
    if (cached && now - cached.timestamp < ttl) {
      return cached.value;
    }

    const result = await func(...args);
    cache.set(key, { value: result, timestamp: now });
    return result;
  } as T & { cache: Map<string, CacheEntry<Awaited<ReturnType<T>>>>; clear: () => void };

  memoized.cache = cache;
  memoized.clear = () => cache.clear();

  return memoized;
}

/**
 * Cache entry with timestamp
 */
interface CacheEntry<T> {
  value: T;
  timestamp: number;
}

