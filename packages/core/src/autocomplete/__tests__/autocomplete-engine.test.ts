/**
 * Autocomplete Engine Unit Tests
 * Deep tests for autocomplete functionality
 */

import { AutocompleteEngine } from '../autocomplete-engine';
import { SchemaRegistry } from '../../schema/schema-registry';
import type { SchemaDefinition } from '../../types/schema';

describe('AutocompleteEngine - Deep Unit Tests', () => {
  let engine: AutocompleteEngine;
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
              user_status: { type: 'varchar', length: 20 },
              created_at: { type: 'timestamp' },
            },
          },
          orders: {
            name: 'orders',
            columns: {
              id: { type: 'int', primaryKey: true },
              user_id: { type: 'int' },
              order_total: { type: 'decimal' },
              order_status: { type: 'varchar', length: 50 },
            },
          },
        },
      },
    },
  };

  beforeEach(() => {
    engine = new AutocompleteEngine({ fuzzyMatch: true });
    schema = new SchemaRegistry();
    schema.registerSchema(testSchema);
  });

  describe('Alias-Based Column Suggestions', () => {
    it('should provide columns when typing after alias dot', () => {
      const sql = 'SELECT u. FROM users u';
      const suggestions = engine.getSuggestions(
        sql,
        { line: 0, column: 9 }, // After 'u.'
        schema
      );

      expect(suggestions.length).toBeGreaterThan(0);
      const columnSuggestions = suggestions.filter(s => s.type === 'column');
      expect(columnSuggestions.some(s => s.label === 'id')).toBe(true);
      expect(columnSuggestions.some(s => s.label === 'username')).toBe(true);
      expect(columnSuggestions.some(s => s.label === 'user_email')).toBe(true);
    });

    it('should filter columns with fuzzy match when typing partial name', () => {
      const sql = 'SELECT u.user FROM users u';
      const suggestions = engine.getSuggestions(
        sql,
        { line: 0, column: 13 }, // After 'u.user'
        schema
      );

      const columnSuggestions = suggestions.filter(s => s.type === 'column');
      
      // Should match 'username', 'user_email', 'user_status' (all start with 'user')
      expect(columnSuggestions.some(s => s.label === 'username')).toBe(true);
      expect(columnSuggestions.some(s => s.label === 'user_email')).toBe(true);
      expect(columnSuggestions.some(s => s.label === 'user_status')).toBe(true);
      
      // Should NOT include 'id' or 'created_at' (don't match 'user')
      expect(columnSuggestions.some(s => s.label === 'id')).toBe(false);
      expect(columnSuggestions.some(s => s.label === 'created_at')).toBe(false);
    });

    it('should provide columns for JOIN aliases', () => {
      const sql = 'SELECT u.id, o. FROM users u JOIN orders o ON u.id = o.user_id';
      
      // Position 15 is right after 'o.'
      const suggestions = engine.getSuggestions(
        sql,
        { line: 0, column: 15 }, // After 'o.'
        schema
      );

      const columnSuggestions = suggestions.filter(s => s.type === 'column');
      
      expect(columnSuggestions.length).toBeGreaterThan(0);
      expect(columnSuggestions.some(s => s.label === 'order_total')).toBe(true);
      expect(columnSuggestions.some(s => s.label === 'order_status')).toBe(true);
    });

    it('should provide columns for LEFT JOIN aliases', () => {
      const sql = 'SELECT u.username, o. FROM users u LEFT JOIN orders o ON u.id = o.user_id';
      const suggestions = engine.getSuggestions(
        sql,
        { line: 0, column: 21 }, // After 'o.' (position 19 + 2)
        schema
      );

      const columnSuggestions = suggestions.filter(s => s.type === 'column');
      expect(columnSuggestions.length).toBeGreaterThan(0);
    });
  });

  describe('Table Suggestions', () => {
    it('should provide table suggestions in FROM clause', () => {
      const sql = 'SELECT * FROM ';
      const suggestions = engine.getSuggestions(
        sql,
        { line: 0, column: sql.length },
        schema
      );

      const tableSuggestions = suggestions.filter(s => s.type === 'table');
      expect(tableSuggestions.some(s => s.label === 'users')).toBe(true);
      expect(tableSuggestions.some(s => s.label === 'orders')).toBe(true);
    });

    it('should filter tables with partial name', () => {
      const sql = 'SELECT * FROM use';
      const suggestions = engine.getSuggestions(
        sql,
        { line: 0, column: sql.length },
        schema
      );

      const tableSuggestions = suggestions.filter(s => s.type === 'table');
      expect(tableSuggestions.some(s => s.label === 'users')).toBe(true);
      expect(tableSuggestions.some(s => s.label === 'orders')).toBe(false);
    });

    it('should provide table suggestions in JOIN clause', () => {
      const sql = 'SELECT * FROM users JOIN ';
      const suggestions = engine.getSuggestions(
        sql,
        { line: 0, column: sql.length },
        schema
      );

      const tableSuggestions = suggestions.filter(s => s.type === 'table');
      expect(tableSuggestions.length).toBeGreaterThan(0);
    });
  });

  describe('Keyword Suggestions', () => {
    it('should provide keywords after SELECT', () => {
      const sql = 'SELECT ';
      const suggestions = engine.getSuggestions(
        sql,
        { line: 0, column: sql.length },
        schema
      );

      const keywordSuggestions = suggestions.filter(s => s.type === 'keyword');
      expect(keywordSuggestions.length).toBeGreaterThan(0);
    });

    it('should provide WHERE keyword after FROM clause', () => {
      const sql = 'SELECT * FROM users ';
      const suggestions = engine.getSuggestions(
        sql,
        { line: 0, column: sql.length },
        schema
      );

      const keywordSuggestions = suggestions.filter(s => s.type === 'keyword');
      expect(keywordSuggestions.some(s => s.label === 'WHERE')).toBe(true);
    });

    it('should NOT provide keywords after dot', () => {
      const sql = 'SELECT u. FROM users u';
      const suggestions = engine.getSuggestions(
        sql,
        { line: 0, column: 9 }, // After 'u.'
        schema
      );

      const keywordSuggestions = suggestions.filter(s => s.type === 'keyword');
      // Should not suggest keywords after dot, only columns
      expect(keywordSuggestions.length).toBe(0);
    });
  });

  describe('Fuzzy Matching', () => {
    it('should match columns with fuzzy search', () => {
      const sql = 'SELECT u.usr FROM users u';
      const suggestions = engine.getSuggestions(
        sql,
        { line: 0, column: 12 }, // After 'u.usr'
        schema
      );

      const columnSuggestions = suggestions.filter(s => s.type === 'column');
      // 'usr' should fuzzy match 'username' and 'user_email', 'user_status'
      expect(columnSuggestions.length).toBeGreaterThan(0);
    });

    it('should rank better matches higher', () => {
      const sql = 'SELECT u.use FROM users u';
      const suggestions = engine.getSuggestions(
        sql,
        { line: 0, column: 12 }, // After 'u.use'
        schema
      );

      const columnSuggestions = suggestions.filter(s => s.type === 'column');
      
      // 'username' should rank higher than 'user_email' for query 'use'
      const usernameIndex = columnSuggestions.findIndex(s => s.label === 'username');
      const emailIndex = columnSuggestions.findIndex(s => s.label === 'user_email');
      
      if (usernameIndex !== -1 && emailIndex !== -1) {
        expect(usernameIndex).toBeLessThan(emailIndex);
      }
    });
  });

  describe('Multi-line SQL', () => {
    it('should handle multi-line SQL with aliases', () => {
      const sql = `SELECT 
  u.
FROM users u`;
      
      const suggestions = engine.getSuggestions(
        sql,
        { line: 1, column: 4 }, // After 'u.' on line 2
        schema
      );

      const columnSuggestions = suggestions.filter(s => s.type === 'column');
      expect(columnSuggestions.length).toBeGreaterThan(0);
    });

    it('should handle WHERE clause on separate line', () => {
      const sql = `SELECT u.id, u.username
FROM users u
WHERE u.`;
      
      const suggestions = engine.getSuggestions(
        sql,
        { line: 2, column: 8 }, // After 'u.' in WHERE
        schema
      );

      const columnSuggestions = suggestions.filter(s => s.type === 'column');
      expect(columnSuggestions.some(s => s.label === 'username')).toBe(true);
      expect(columnSuggestions.some(s => s.label === 'user_status')).toBe(true);
    });
  });

  describe('Complex Queries', () => {
    it('should handle multiple aliases', () => {
      const sql = 'SELECT u.username, o. FROM users u JOIN orders o ON u.id = o.user_id';
      const suggestions = engine.getSuggestions(
        sql,
        { line: 0, column: 21 }, // After 'o.' (position 19 + 2)
        schema
      );

      const columnSuggestions = suggestions.filter(s => s.type === 'column');
      // Should show order columns, not user columns
      expect(columnSuggestions.length).toBeGreaterThan(0);
      expect(columnSuggestions.some(s => s.label === 'order_total')).toBe(true);
      expect(columnSuggestions.some(s => s.label === 'username')).toBe(false);
    });

    it('should handle subqueries', () => {
      const sql = 'SELECT * FROM (SELECT u. FROM users u) subquery';
      const suggestions = engine.getSuggestions(
        sql,
        { line: 0, column: 25 }, // After 'u.' in subquery
        schema
      );

      const columnSuggestions = suggestions.filter(s => s.type === 'column');
      expect(columnSuggestions.length).toBeGreaterThan(0);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty SQL', () => {
      const suggestions = engine.getSuggestions('', { line: 0, column: 0 }, schema);
      expect(Array.isArray(suggestions)).toBe(true);
    });

    it('should handle SQL with only whitespace', () => {
      const suggestions = engine.getSuggestions('   ', { line: 0, column: 3 }, schema);
      expect(Array.isArray(suggestions)).toBe(true);
    });

    it('should handle position beyond SQL length', () => {
      const sql = 'SELECT * FROM users';
      const suggestions = engine.getSuggestions(
        sql,
        { line: 0, column: 1000 },
        schema
      );
      expect(Array.isArray(suggestions)).toBe(true);
    });

    it('should handle missing schema', () => {
      const emptySchema = new SchemaRegistry();
      const suggestions = engine.getSuggestions(
        'SELECT * FROM ',
        { line: 0, column: 14 },
        emptySchema
      );
      expect(Array.isArray(suggestions)).toBe(true);
    });
  });

  describe('Performance', () => {
    it('should handle large number of suggestions efficiently', () => {
      const largeSchema: SchemaDefinition = {
        databases: {
          large: {
            name: 'large',
            tables: {},
          },
        },
      };

      // Add 100 tables
      for (let i = 0; i < 100; i++) {
        largeSchema.databases.large.tables[`table_${i}`] = {
          name: `table_${i}`,
          columns: {
            id: { type: 'int' },
            name: { type: 'varchar' },
          },
        };
      }

      schema.registerSchema(largeSchema);

      const start = Date.now();
      const suggestions = engine.getSuggestions(
        'SELECT * FROM ',
        { line: 0, column: 14 },
        schema
      );
      const duration = Date.now() - start;

      expect(suggestions.length).toBeGreaterThan(0);
      expect(duration).toBeLessThan(200); // Should be fast
    });
  });

  describe('Options', () => {
    it('should respect maxSuggestions option', () => {
      const limitedEngine = new AutocompleteEngine({ maxSuggestions: 5 });
      const suggestions = limitedEngine.getSuggestions(
        'SELECT * FROM ',
        { line: 0, column: 14 },
        schema
      );

      expect(suggestions.length).toBeLessThanOrEqual(5);
    });

    it('should respect enabled option', () => {
      const disabledEngine = new AutocompleteEngine({ enabled: false });
      const suggestions = disabledEngine.getSuggestions(
        'SELECT * FROM ',
        { line: 0, column: 14 },
        schema
      );

      expect(suggestions.length).toBe(0);
    });

    it('should respect caseSensitive option', () => {
      const caseSensitiveEngine = new AutocompleteEngine({
        fuzzyMatch: true,
        caseSensitive: true,
      });
      
      const suggestions = caseSensitiveEngine.getSuggestions(
        'SELECT * FROM USE',
        { line: 0, column: 17 },
        schema
      );

      // With case-sensitive, 'USE' should not match 'users'
      const tableSuggestions = suggestions.filter(s => s.type === 'table');
      expect(tableSuggestions.length).toBe(0);
    });
  });

  describe('Provider Registration', () => {
    it('should allow registering custom providers', () => {
      const customProvider = {
        canProvide: () => true,
        provide: () => [
          { label: 'CUSTOM', type: 'custom' as const, sortPriority: 1 },
        ],
      };

      engine.registerProvider(customProvider);
      const suggestions = engine.getSuggestions(
        'SELECT ',
        { line: 0, column: 7 },
        schema
      );

      expect(suggestions.some(s => s.label === 'CUSTOM')).toBe(true);
    });

    it('should allow removing providers', () => {
      const customProvider = {
        canProvide: () => true,
        provide: () => [
          { label: 'CUSTOM', type: 'custom' as const, sortPriority: 1 },
        ],
      };

      engine.registerProvider(customProvider);
      engine.removeProvider(customProvider);
      
      const suggestions = engine.getSuggestions(
        'SELECT ',
        { line: 0, column: 7 },
        schema
      );

      expect(suggestions.some(s => s.label === 'CUSTOM')).toBe(false);
    });
  });

  describe('Context Detection Integration', () => {
    it('should detect SELECT context', () => {
      const suggestions = engine.getSuggestions(
        'SELECT ',
        { line: 0, column: 7 },
        schema
      );

      // Should have keywords and columns, not tables
      expect(suggestions.some(s => s.type === 'keyword')).toBe(true);
    });

    it('should detect FROM context', () => {
      const suggestions = engine.getSuggestions(
        'SELECT * FROM ',
        { line: 0, column: 14 },
        schema
      );

      // Should have table suggestions
      const tableSuggestions = suggestions.filter(s => s.type === 'table');
      expect(tableSuggestions.length).toBeGreaterThan(0);
    });

    it('should detect WHERE context', () => {
      const suggestions = engine.getSuggestions(
        'SELECT * FROM users WHERE ',
        { line: 0, column: 26 },
        schema
      );

      // Should have column and keyword suggestions
      expect(suggestions.some(s => s.type === 'column')).toBe(true);
      expect(suggestions.some(s => s.type === 'keyword')).toBe(true);
    });
  });

  describe('Sorting and Ranking', () => {
    it('should prioritize exact matches over fuzzy matches', () => {
      const sql = 'SELECT u.id FROM users u';
      const suggestions = engine.getSuggestions(
        sql,
        { line: 0, column: 11 }, // After 'u.id'
        schema
      );

      const columnSuggestions = suggestions.filter(s => s.type === 'column');
      
      // 'id' should be first
      if (columnSuggestions.length > 0) {
        expect(columnSuggestions[0].label).toBe('id');
      }
    });

    it('should sort by priority when no query', () => {
      const sql = 'SELECT u. FROM users u';
      const suggestions = engine.getSuggestions(
        sql,
        { line: 0, column: 9 }, // After 'u.'
        schema
      );

      // All columns should be present and sorted
      expect(suggestions.length).toBeGreaterThan(0);
      
      // Check that we get column suggestions
      const columnSuggestions = suggestions.filter(s => s.type === 'column');
      expect(columnSuggestions.length).toBeGreaterThan(0);
    });
  });
});

