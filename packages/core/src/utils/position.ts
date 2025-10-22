/**
 * Position and range utilities
 * @packageDocumentation
 */

import type { Position, Range } from '../types/common';

/**
 * Check if two positions are equal
 *
 * @param a - First position
 * @param b - Second position
 * @returns Whether positions are equal
 */
export function positionEquals(a: Position, b: Position): boolean {
  return a.line === b.line && a.column === b.column;
}

/**
 * Compare two positions
 *
 * @param a - First position
 * @param b - Second position
 * @returns -1 if a < b, 0 if a === b, 1 if a > b
 */
export function positionCompare(a: Position, b: Position): number {
  if (a.line < b.line) return -1;
  if (a.line > b.line) return 1;
  if (a.column < b.column) return -1;
  if (a.column > b.column) return 1;
  return 0;
}

/**
 * Check if position is before another position
 *
 * @param a - First position
 * @param b - Second position
 * @returns Whether a is before b
 */
export function positionBefore(a: Position, b: Position): boolean {
  return positionCompare(a, b) < 0;
}

/**
 * Check if position is after another position
 *
 * @param a - First position
 * @param b - Second position
 * @returns Whether a is after b
 */
export function positionAfter(a: Position, b: Position): boolean {
  return positionCompare(a, b) > 0;
}

/**
 * Check if position is within a range
 *
 * @param position - Position to check
 * @param range - Range to check against
 * @param inclusive - Whether to include range boundaries
 * @returns Whether position is in range
 */
export function positionInRange(
  position: Position,
  range: Range,
  inclusive: boolean = true
): boolean {
  const afterStart = inclusive
    ? positionCompare(position, range.start) >= 0
    : positionAfter(position, range.start);

  const beforeEnd = inclusive
    ? positionCompare(position, range.end) <= 0
    : positionBefore(position, range.end);

  return afterStart && beforeEnd;
}

/**
 * Get offset from position in text
 *
 * @param text - Text content
 * @param position - Position in text
 * @returns Character offset
 */
export function positionToOffset(text: string, position: Position): number {
  const lines = text.split('\n');
  let offset = 0;

  for (let i = 0; i < position.line && i < lines.length; i++) {
    offset += lines[i]!.length + 1; // +1 for newline
  }

  offset += position.column;
  return offset;
}

/**
 * Get position from offset in text
 *
 * @param text - Text content
 * @param offset - Character offset
 * @returns Position in text
 */
export function offsetToPosition(text: string, offset: number): Position {
  const lines = text.split('\n');
  let currentOffset = 0;

  for (let line = 0; line < lines.length; line++) {
    const lineLength = lines[line]!.length;

    if (currentOffset + lineLength >= offset) {
      return {
        line,
        column: offset - currentOffset,
      };
    }

    currentOffset += lineLength + 1; // +1 for newline
  }

  // If offset is beyond text, return end position
  return {
    line: Math.max(0, lines.length - 1),
    column: lines[lines.length - 1]?.length || 0,
  };
}

/**
 * Create a range from two positions
 *
 * @param start - Start position
 * @param end - End position
 * @returns Range
 */
export function createRange(start: Position, end: Position): Range {
  return { start, end };
}

/**
 * Check if two ranges overlap
 *
 * @param a - First range
 * @param b - Second range
 * @returns Whether ranges overlap
 */
export function rangesOverlap(a: Range, b: Range): boolean {
  return (
    positionInRange(a.start, b) ||
    positionInRange(a.end, b) ||
    positionInRange(b.start, a) ||
    positionInRange(b.end, a)
  );
}

