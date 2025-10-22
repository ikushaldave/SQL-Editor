/**
 * Fuzzy matching utility for autocomplete
 * @packageDocumentation
 */

/**
 * Calculate fuzzy match score between query and target
 *
 * @param query - Search query
 * @param target - Target string to match against
 * @param caseSensitive - Whether matching is case-sensitive
 * @returns Match score (0-1, higher is better) or -1 if no match
 *
 * @example
 * ```typescript
 * fuzzyMatch('usr', 'users'); // Returns ~0.8
 * fuzzyMatch('usrn', 'username'); // Returns ~0.9
 * fuzzyMatch('xyz', 'users'); // Returns -1
 * ```
 */
export function fuzzyMatch(
  query: string,
  target: string,
  caseSensitive: boolean = false
): number {
  if (!query) return 1;
  if (!target) return -1;

  const q = caseSensitive ? query : query.toLowerCase();
  const t = caseSensitive ? target : target.toLowerCase();

  // Exact match
  if (q === t) return 1;

  // Starts with (high score)
  if (t.startsWith(q)) return 0.9;

  // Contains (medium score)
  if (t.includes(q)) return 0.7;

  // Fuzzy sequential match
  let queryIndex = 0;
  let targetIndex = 0;
  let score = 0;
  let consecutiveMatches = 0;

  while (queryIndex < q.length && targetIndex < t.length) {
    if (q[queryIndex] === t[targetIndex]) {
      queryIndex++;
      consecutiveMatches++;
      // Bonus for consecutive matches
      score += 1 + (consecutiveMatches * 0.1);
    } else {
      consecutiveMatches = 0;
    }
    targetIndex++;
  }

  // All query characters matched
  if (queryIndex === q.length) {
    const matchRatio = score / (q.length * 1.5); // Normalize score
    const lengthPenalty = 1 - (t.length - q.length) / t.length;
    return Math.min(1, matchRatio * lengthPenalty) * 0.6;
  }

  return -1; // No match
}

/**
 * Sort items by fuzzy match score
 *
 * @param items - Items to sort
 * @param query - Search query
 * @param getValue - Function to extract string value from item
 * @param caseSensitive - Whether matching is case-sensitive
 * @returns Sorted items with scores
 */
export function fuzzySort<T>(
  items: T[],
  query: string,
  getValue: (item: T) => string,
  caseSensitive: boolean = false
): Array<T & { score: number }> {
  const scored = items
    .map((item) => ({
      ...item,
      score: fuzzyMatch(query, getValue(item), caseSensitive),
    }))
    .filter((item) => item.score > 0);

  // Sort by score (descending)
  scored.sort((a, b) => b.score - a.score);

  return scored;
}

