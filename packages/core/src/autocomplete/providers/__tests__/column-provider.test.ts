/**
 * Column Provider Deep Unit Tests
 */

import { ColumnCompletionProvider } from '../column-provider';
import { SchemaRegistry } from '../../../schema/schema-registry';
import type { SQLContext } from '../../../types/sql';
import type { SchemaDefinition } from '../../../types/schema';

describe('ColumnCompletionProvider - Deep Tests', () => {
  let provider: ColumnCompletionProvider;
  let schema: SchemaRegistry;

  const testSchema: SchemaDefinition = {
    databases: {
      testdb: {
        name: 'testdb',
        tables: {
          users: {
            name: 'users',
            columns: {
              id: { type: 'int', primaryKey: true },
              username: { type: 'varchar', length: 50 },
              user_email: { type: 'varchar', length: 255 },
              user_phone: { type: 'varchar', length: 20 },
              status: { type: 'varchar', length: 20 },
            },
          },
          orders: {
            name: 'orders',
            columns: {
              id: { type: 'int', primaryKey: true },
              order_number: { type: 'varchar', length: 50 },
              order_total: { type: 'decimal' },
            },
          },
        },
      },
    },
  };

  beforeEach(() => {
    provider = new ColumnCompletionProvider();
    schema = new SchemaRegistry();
    schema.registerSchema(testSchema);
  });

  describe('canProvide()', () => {
    it('should provide in select_list context', () => {
      const context: SQLContext = {
        type: 'select_list',
        position: { line: 0, column: 7 },
        availableTables: [],
        currentToken: '',
        afterDot: false,
      };

      expect(provider.canProvide(context)).toBe(true);
    });

    it('should provide in where_clause context', () => {
      const context: SQLContext = {
        type: 'where_clause',
        position: { line: 0, column: 26 },
        availableTables: [],
        currentToken: '',
        afterDot: false,
      };

      expect(provider.canProvide(context)).toBe(true);
    });

    it('should provide after dot', () => {
      const context: SQLContext = {
        type: 'select_list',
        position: { line: 0, column: 9 },
        availableTables: [{ name: 'users', alias: 'u' }],
        currentToken: '',
        afterDot: true,
        dotPrefix: 'u',
      };

      expect(provider.canProvide(context)).toBe(true);
    });

    it('should NOT provide in from_clause without dot', () => {
      const context: SQLContext = {
        type: 'from_clause',
        position: { line: 0, column: 14 },
        availableTables: [],
        currentToken: '',
        afterDot: false,
      };

      expect(provider.canProvide(context)).toBe(false);
    });
  });

  describe('provide() - After Dot', () => {
    it('should provide columns for valid alias', () => {
      const context: SQLContext = {
        type: 'select_list',
        position: { line: 0, column: 9 },
        availableTables: [{ name: 'users', alias: 'u' }],
        currentToken: '',
        afterDot: true,
        dotPrefix: 'u',
      };

      const completions = provider.provide(context, schema);

      expect(completions.length).toBe(5); // All user columns
      expect(completions.some(c => c.label === 'id')).toBe(true);
      expect(completions.some(c => c.label === 'username')).toBe(true);
      expect(completions.some(c => c.label === 'user_email')).toBe(true);
      expect(completions.some(c => c.label === 'user_phone')).toBe(true);
      expect(completions.some(c => c.label === 'status')).toBe(true);
    });

    it('should provide columns for table name (no alias)', () => {
      const context: SQLContext = {
        type: 'select_list',
        position: { line: 0, column: 13 },
        availableTables: [{ name: 'users' }],
        currentToken: '',
        afterDot: true,
        dotPrefix: 'users',
      };

      const completions = provider.provide(context, schema);

      expect(completions.length).toBe(5);
      expect(completions.some(c => c.label === 'username')).toBe(true);
    });

    it('should return empty array for invalid alias', () => {
      const context: SQLContext = {
        type: 'select_list',
        position: { line: 0, column: 9 },
        availableTables: [{ name: 'users', alias: 'u' }],
        currentToken: '',
        afterDot: true,
        dotPrefix: 'invalid', // Non-existent alias
      };

      const completions = provider.provide(context, schema);

      expect(completions.length).toBe(0);
    });

    it('should provide columns with correct metadata', () => {
      const context: SQLContext = {
        type: 'select_list',
        position: { line: 0, column: 9 },
        availableTables: [{ name: 'users', alias: 'u' }],
        currentToken: '',
        afterDot: true,
        dotPrefix: 'u',
      };

      const completions = provider.provide(context, schema);
      const usernameCompletion = completions.find(c => c.label === 'username');

      expect(usernameCompletion).toBeDefined();
      expect(usernameCompletion?.type).toBe('column');
      expect(usernameCompletion?.detail).toContain('varchar');
      expect(usernameCompletion?.metadata).toBeDefined();
      expect(usernameCompletion?.metadata?.tableName).toBe('users');
    });
  });

  describe('provide() - Without Dot', () => {
    it('should provide qualified column names', () => {
      const context: SQLContext = {
        type: 'select_list',
        position: { line: 0, column: 7 },
        availableTables: [{ name: 'users', alias: 'u' }],
        currentToken: '',
        afterDot: false,
      };

      const completions = provider.provide(context, schema);

      expect(completions.length).toBeGreaterThan(0);
      
      // Should have insertText with table prefix
      const usernameCompletion = completions.find(c => c.label === 'username');
      expect(usernameCompletion?.insertText).toBe('u.username');
    });

    it('should provide columns from multiple tables', () => {
      const context: SQLContext = {
        type: 'select_list',
        position: { line: 0, column: 7 },
        availableTables: [
          { name: 'users', alias: 'u' },
          { name: 'orders', alias: 'o' },
        ],
        currentToken: '',
        afterDot: false,
      };

      const completions = provider.provide(context, schema);

      // Should have columns from both tables
      expect(completions.some(c => c.label === 'username')).toBe(true);
      expect(completions.some(c => c.label === 'order_number')).toBe(true);
    });
  });

  describe('Priority', () => {
    it('should set higher priority for dot-prefixed columns', () => {
      const contextWithDot: SQLContext = {
        type: 'select_list',
        position: { line: 0, column: 9 },
        availableTables: [{ name: 'users', alias: 'u' }],
        currentToken: '',
        afterDot: true,
        dotPrefix: 'u',
      };

      const completions = provider.provide(contextWithDot, schema);

      // Dot-prefixed should have sortPriority 0 (highest)
      expect(completions[0].sortPriority).toBe(0);
    });

    it('should set lower priority for qualified columns', () => {
      const contextNoDot: SQLContext = {
        type: 'select_list',
        position: { line: 0, column: 7 },
        availableTables: [{ name: 'users', alias: 'u' }],
        currentToken: '',
        afterDot: false,
      };

      const completions = provider.provide(contextNoDot, schema);

      // Qualified should have sortPriority 2 (lower)
      expect(completions[0].sortPriority).toBe(2);
    });
  });
});

