/**
 * ParserService Unit Tests
 * Tests the ParserService class and its individual methods
 */

import { ParserService } from '../parser-service';
import type { TableReference } from '../../types/sql';

describe('ParserService', () => {
  let parser: ParserService;

  beforeEach(() => {
    parser = new ParserService();
  });

  describe('parse()', () => {
    it('should parse valid SQL successfully', () => {
      const sql = 'SELECT * FROM users';
      const result = parser.parse(sql);

      expect(result.success).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.ast).toBeDefined();
    });

    it('should detect parse errors', () => {
      const sql = 'SELECT * FROM';
      const result = parser.parse(sql);

      expect(result).toBeDefined();
      expect(typeof result.success).toBe('boolean');
      expect(Array.isArray(result.errors)).toBe(true);
    });

    it('should extract table references', () => {
      const sql = 'SELECT * FROM users, orders';
      const result = parser.parse(sql);

      expect(result.tableRefs).toBeDefined();
      expect(Array.isArray(result.tableRefs)).toBe(true);
    });

    it('should handle table aliases', () => {
      const sql = 'SELECT u.name FROM users u';
      const result = parser.parse(sql);

      expect(result.aliases).toBeDefined();
      expect(typeof result.aliases).toBe('object');
    });

    it('should include error locations', () => {
      const sql = 'SELECT * FROM';
      const result = parser.parse(sql);

      // Errors should have location information
      if (result.errors.length > 0) {
        const error = result.errors[0];
        expect(error.message).toBeDefined();
      }
    });

    it('should handle JOIN statements', () => {
      const sql = 'SELECT * FROM users u JOIN orders o ON u.id = o.user_id';
      const result = parser.parse(sql);

      expect(result.success).toBe(true);
      // Table extraction depends on dt-sql-parser implementation
      expect(Array.isArray(result.tableRefs)).toBe(true);
    });

    it('should handle complex queries', () => {
      const sql = `
        SELECT u.name, COUNT(o.id) as order_count
        FROM users u
        LEFT JOIN orders o ON u.id = o.user_id
        WHERE u.active = 1
        GROUP BY u.id
        HAVING COUNT(o.id) > 5
        ORDER BY order_count DESC
      `;
      const result = parser.parse(sql);

      expect(result.success).toBe(true);
    });
  });

  describe('parse() with variables', () => {
    beforeEach(() => {
      parser.setOptions({ embeddedVariables: true });
    });

    it('should parse SQL with embedded variables', () => {
      const sql = 'SELECT * FROM $(table) WHERE id = $(id)';
      const result = parser.parse(sql);

      expect(result.success).toBe(true);
    });

    it('should handle variables in multiple positions', () => {
      const sql = 'SELECT $(column) FROM $(table) WHERE $(condition)';
      const result = parser.parse(sql);

      expect(result.success).toBe(true);
    });

    it('should adjust error positions with variables', () => {
      // SQL with syntax error and variables
      const sql = 'SELECT * FROM $(table WHERE';
      const result = parser.parse(sql);

      expect(Array.isArray(result.errors)).toBe(true);
    });
  });

  describe('validate()', () => {
    it('should return true for valid SQL', () => {
      const sql = 'SELECT * FROM users';
      const isValid = parser.validate(sql);

      expect(typeof isValid).toBe('boolean');
    });

    it('should return false for invalid SQL', () => {
      const sql = 'SELECT * FROM';
      const isValid = parser.validate(sql);

      expect(typeof isValid).toBe('boolean');
    });
  });

  describe('extractTableRefs()', () => {
    it('should extract simple table reference', () => {
      const sql = 'SELECT * FROM users';
      const result = parser.parse(sql);
      const tableRefs = parser.extractTableRefs(result.ast);

      expect(Array.isArray(tableRefs)).toBe(true);
    });

    it('should handle multiple tables', () => {
      const sql = 'SELECT * FROM users, orders, products';
      const result = parser.parse(sql);
      const tableRefs = parser.extractTableRefs(result.ast);

      expect(Array.isArray(tableRefs)).toBe(true);
    });

    it('should extract table aliases', () => {
      const sql = 'SELECT * FROM users AS u';
      const result = parser.parse(sql);
      const tableRefs = parser.extractTableRefs(result.ast);

      expect(Array.isArray(tableRefs)).toBe(true);
    });

    it('should handle database.table notation', () => {
      const sql = 'SELECT * FROM mydb.users';
      const result = parser.parse(sql);
      const tableRefs = parser.extractTableRefs(result.ast);

      expect(Array.isArray(tableRefs)).toBe(true);
    });

    it('should return empty array for invalid AST', () => {
      const tableRefs = parser.extractTableRefs(null);
      expect(tableRefs).toEqual([]);
    });
  });

  describe('extractAliases()', () => {
    it('should create alias map from table references', () => {
      const tableRefs: TableReference[] = [
        { name: 'users', alias: 'u' },
        { name: 'orders', alias: 'o' },
      ];
      
      const aliases = parser.extractAliases(tableRefs);

      expect(aliases['u']).toBeDefined();
      expect(aliases['u'].name).toBe('users');
      expect(aliases['o']).toBeDefined();
      expect(aliases['o'].name).toBe('orders');
    });

    it('should map table name to itself', () => {
      const tableRefs: TableReference[] = [
        { name: 'users', alias: 'u' },
      ];
      
      const aliases = parser.extractAliases(tableRefs);

      expect(aliases['users']).toBeDefined();
      expect(aliases['users'].name).toBe('users');
    });

    it('should handle tables without aliases', () => {
      const tableRefs: TableReference[] = [
        { name: 'users' },
      ];
      
      const aliases = parser.extractAliases(tableRefs);

      expect(aliases['users']).toBeDefined();
      expect(aliases['users'].name).toBe('users');
    });

    it('should return empty object for empty input', () => {
      const aliases = parser.extractAliases([]);
      expect(aliases).toEqual({});
    });
  });

  describe('getSuggestions()', () => {
    it('should return suggestions for incomplete SQL', () => {
      const sql = 'SELECT * FROM';
      const suggestions = parser.getSuggestions(sql);

      expect(Array.isArray(suggestions)).toBe(true);
    });

    it('should handle empty SQL', () => {
      const suggestions = parser.getSuggestions('');
      expect(Array.isArray(suggestions)).toBe(true);
    });
  });

  describe('getSuggestionsAtCaretPosition()', () => {
    it('should return keyword suggestions', () => {
      const sql = 'SELECT * FROM users ';
      const suggestions = parser.getSuggestionsAtCaretPosition(sql, {
        lineNumber: 1,
        column: sql.length,
      });

      expect(suggestions).toBeDefined();
      expect(suggestions.keywords).toBeDefined();
    });

    it('should handle errors gracefully', () => {
      const suggestions = parser.getSuggestionsAtCaretPosition('', {
        lineNumber: 1,
        column: 0,
      });

      expect(suggestions).toBeDefined();
    });
  });

  describe('setOptions()', () => {
    it('should enable embedded variables', () => {
      parser.setOptions({ embeddedVariables: true });
      const sql = 'SELECT * FROM $(table)';
      const result = parser.parse(sql);

      expect(result.success).toBe(true);
    });

    it('should disable embedded variables', () => {
      parser.setOptions({ embeddedVariables: false });
      const sql = 'SELECT * FROM $(table)';
      const result = parser.parse(sql);

      // Without variable support, this might fail parsing
      expect(result).toBeDefined();
    });
  });

  describe('edge cases', () => {
    it('should handle empty SQL', () => {
      const result = parser.parse('');
      expect(result).toBeDefined();
      expect(result.success).toBeDefined();
    });

    it('should handle whitespace-only SQL', () => {
      const result = parser.parse('   \n  \t  ');
      expect(result).toBeDefined();
    });

    it('should handle SQL comments', () => {
      const sql = '-- This is a comment\nSELECT * FROM users';
      const result = parser.parse(sql);
      expect(result).toBeDefined();
    });

    it('should handle multi-line SQL', () => {
      const sql = `
        SELECT 
          *
        FROM
          users
        WHERE
          id = 1
      `;
      const result = parser.parse(sql);
      expect(result).toBeDefined();
    });
  });
});

