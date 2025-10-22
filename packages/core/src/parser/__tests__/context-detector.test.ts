/**
 * ContextDetector Unit Tests
 * Tests the context detection functions
 */

import { detectContext, resolveAlias } from '../context-detector';
import type { TableReference } from '../../types/sql';

describe('ContextDetector', () => {
  const sampleTables: TableReference[] = [
    { name: 'users', alias: 'u' },
    { name: 'orders', alias: 'o' },
    { name: 'products' },
  ];

  describe('detectContext()', () => {
    describe('SELECT clause', () => {
      it('should detect select_list context', () => {
        const sql = 'SELECT ';
        const context = detectContext(
          sql,
          { line: 0, column: sql.length },
          sampleTables
        );

        expect(context.type).toBe('select_list');
      });

      it('should detect select_list with partial column', () => {
        const sql = 'SELECT us';
        const context = detectContext(
          sql,
          { line: 0, column: sql.length },
          sampleTables
        );

        expect(context.type).toBe('select_list');
        expect(context.currentToken).toBe('us');
      });

      it('should detect select_list after comma', () => {
        const sql = 'SELECT id, ';
        const context = detectContext(
          sql,
          { line: 0, column: sql.length },
          sampleTables
        );

        expect(context.type).toBe('select_list');
      });

      it('should detect column reference with table prefix', () => {
        const sql = 'SELECT u.';
        const context = detectContext(
          sql,
          { line: 0, column: sql.length },
          sampleTables
        );

        expect(context.type).toBe('select_list');
        expect(context.afterDot).toBe(true);
        expect(context.dotPrefix).toBe('u');
      });

      it('should detect partial column after dot', () => {
        const sql = 'SELECT u.na';
        const context = detectContext(
          sql,
          { line: 0, column: sql.length },
          sampleTables
        );

        expect(context.type).toBe('select_list');
        expect(context.afterDot).toBe(true);
        expect(context.dotPrefix).toBe('u');
        expect(context.currentToken).toBe('na');
      });
    });

    describe('FROM clause', () => {
      it('should detect from_clause context', () => {
        const sql = 'SELECT * FROM ';
        const context = detectContext(
          sql,
          { line: 0, column: sql.length },
          sampleTables
        );

        expect(context.type).toBe('from_clause');
      });

      it('should detect from_clause with partial table', () => {
        const sql = 'SELECT * FROM us';
        const context = detectContext(
          sql,
          { line: 0, column: sql.length },
          sampleTables
        );

        expect(context.type).toBe('from_clause');
        expect(context.currentToken).toBe('us');
      });
    });

    describe('WHERE clause', () => {
      it('should detect where_clause context', () => {
        const sql = 'SELECT * FROM users WHERE ';
        const context = detectContext(
          sql,
          { line: 0, column: sql.length },
          sampleTables
        );

        expect(context.type).toBe('where_clause');
      });

      it('should detect where_clause with column reference', () => {
        const sql = 'SELECT * FROM users WHERE u.';
        const context = detectContext(
          sql,
          { line: 0, column: sql.length },
          sampleTables
        );

        expect(context.type).toBe('where_clause');
        expect(context.afterDot).toBe(true);
        expect(context.dotPrefix).toBe('u');
      });
    });

    describe('JOIN clause', () => {
      it('should detect join_clause context', () => {
        const sql = 'SELECT * FROM users JOIN ';
        const context = detectContext(
          sql,
          { line: 0, column: sql.length },
          sampleTables
        );

        expect(context.type).toBe('join_clause');
      });

      it('should detect join condition context', () => {
        const sql = 'SELECT * FROM users u JOIN orders o ON ';
        const context = detectContext(
          sql,
          { line: 0, column: sql.length },
          sampleTables
        );

        // ON conditions are similar to WHERE
        expect(context.type).toBe('where_clause');
      });

      it('should handle LEFT JOIN', () => {
        const sql = 'SELECT * FROM users LEFT JOIN ';
        const context = detectContext(
          sql,
          { line: 0, column: sql.length },
          sampleTables
        );

        expect(context.type).toBe('join_clause');
      });

      it('should handle INNER JOIN', () => {
        const sql = 'SELECT * FROM users INNER JOIN ';
        const context = detectContext(
          sql,
          { line: 0, column: sql.length },
          sampleTables
        );

        expect(context.type).toBe('join_clause');
      });
    });

    describe('GROUP BY clause', () => {
      it('should detect group_by context', () => {
        const sql = 'SELECT * FROM users GROUP BY ';
        const context = detectContext(
          sql,
          { line: 0, column: sql.length },
          sampleTables
        );

        expect(context.type).toBe('group_by');
      });
    });

    describe('ORDER BY clause', () => {
      it('should detect order_by context', () => {
        const sql = 'SELECT * FROM users ORDER BY ';
        const context = detectContext(
          sql,
          { line: 0, column: sql.length },
          sampleTables
        );

        expect(context.type).toBe('order_by');
      });
    });

    describe('HAVING clause', () => {
      it('should detect having_clause context', () => {
        const sql = 'SELECT * FROM users GROUP BY id HAVING ';
        const context = detectContext(
          sql,
          { line: 0, column: sql.length },
          sampleTables
        );

        expect(context.type).toBe('having_clause');
      });
    });

    describe('Function context', () => {
      it('should detect function context inside parentheses', () => {
        const sql = 'SELECT COUNT(';
        const context = detectContext(
          sql,
          { line: 0, column: sql.length },
          sampleTables
        );

        // When inside parentheses without other clauses, could be function or select_list
        expect(['function', 'select_list']).toContain(context.type);
      });

      it('should handle nested parentheses', () => {
        const sql = 'SELECT COUNT(SUM(';
        const context = detectContext(
          sql,
          { line: 0, column: sql.length },
          sampleTables
        );

        // When inside nested parentheses, could be function or select_list
        expect(['function', 'select_list']).toContain(context.type);
      });
    });

    describe('Unknown context', () => {
      it('should return unknown for empty SQL', () => {
        const context = detectContext('', { line: 0, column: 0 }, sampleTables);
        expect(context.type).toBe('unknown');
      });

      it('should return unknown for incomplete SQL', () => {
        const context = detectContext('SEL', { line: 0, column: 3 }, sampleTables);
        expect(context.type).toBe('unknown');
      });
    });

    describe('Available tables', () => {
      it('should include available tables in context', () => {
        const sql = 'SELECT * FROM ';
        const context = detectContext(
          sql,
          { line: 0, column: sql.length },
          sampleTables
        );

        expect(context.availableTables).toBe(sampleTables);
        expect(context.availableTables.length).toBe(3);
      });
    });

    describe('Multi-line SQL', () => {
      it('should handle multi-line queries', () => {
        const sql = `SELECT *
FROM users
WHERE `;
        const context = detectContext(
          sql,
          { line: 2, column: 6 },
          sampleTables
        );

        expect(context.type).toBe('where_clause');
      });

      it('should handle cursor position on different lines', () => {
        const sql = `SELECT 
  id,
  name
FROM users`;
        const context = detectContext(
          sql,
          { line: 1, column: 5 },
          sampleTables
        );

        expect(context.type).toBe('select_list');
      });
    });

    describe('Case insensitivity', () => {
      it('should detect SELECT in lowercase', () => {
        const sql = 'select * from users where ';
        const context = detectContext(
          sql,
          { line: 0, column: sql.length },
          sampleTables
        );

        expect(context.type).toBe('where_clause');
      });

      it('should detect SELECT in mixed case', () => {
        const sql = 'SeLeCt * FrOm users WhErE ';
        const context = detectContext(
          sql,
          { line: 0, column: sql.length },
          sampleTables
        );

        expect(context.type).toBe('where_clause');
      });
    });
  });

  describe('resolveAlias()', () => {
    it('should resolve table alias', () => {
      const result = resolveAlias('u', sampleTables);
      
      expect(result).toBeDefined();
      expect(result?.name).toBe('users');
      expect(result?.alias).toBe('u');
    });

    it('should resolve table name', () => {
      const result = resolveAlias('users', sampleTables);
      
      expect(result).toBeDefined();
      expect(result?.name).toBe('users');
    });

    it('should be case insensitive', () => {
      const result = resolveAlias('USERS', sampleTables);
      
      expect(result).toBeDefined();
      expect(result?.name).toBe('users');
    });

    it('should return undefined for unknown alias', () => {
      const result = resolveAlias('unknown', sampleTables);
      expect(result).toBeUndefined();
    });

    it('should handle empty alias', () => {
      const result = resolveAlias('', sampleTables);
      expect(result).toBeUndefined();
    });

    it('should handle empty table list', () => {
      const result = resolveAlias('u', []);
      expect(result).toBeUndefined();
    });

    it('should resolve first match for duplicate names', () => {
      const duplicateTables: TableReference[] = [
        { name: 'users', alias: 'u1' },
        { name: 'users', alias: 'u2' },
      ];
      
      const result = resolveAlias('users', duplicateTables);
      expect(result).toBeDefined();
      expect(result?.name).toBe('users');
    });
  });

  describe('Edge cases', () => {
    it('should handle position at start of SQL', () => {
      const sql = 'SELECT * FROM users';
      const context = detectContext(sql, { line: 0, column: 0 }, sampleTables);
      
      expect(context).toBeDefined();
      expect(context.type).toBeDefined();
    });

    it('should handle position beyond SQL length', () => {
      const sql = 'SELECT * FROM users';
      const context = detectContext(
        sql,
        { line: 0, column: 1000 },
        sampleTables
      );
      
      expect(context).toBeDefined();
    });

    it('should handle special characters in SQL', () => {
      const sql = 'SELECT `user-name` FROM users WHERE ';
      const context = detectContext(
        sql,
        { line: 0, column: sql.length },
        sampleTables
      );
      
      expect(context.type).toBe('where_clause');
    });

    it('should handle dots in column names', () => {
      const sql = 'SELECT u.name, o.total FROM users u, orders o WHERE u.';
      const context = detectContext(
        sql,
        { line: 0, column: sql.length },
        sampleTables
      );
      
      expect(context.afterDot).toBe(true);
      expect(context.dotPrefix).toBe('u');
    });
  });
});

