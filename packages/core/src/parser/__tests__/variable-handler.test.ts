/**
 * VariableHandler Unit Tests
 * Tests the variable handling functionality
 */

import { VariableHandler } from '../variable-handler';

describe('VariableHandler', () => {
  let handler: VariableHandler;

  beforeEach(() => {
    handler = new VariableHandler();
  });

  describe('hasVariables()', () => {
    it('should detect variables in SQL', () => {
      const sql = 'SELECT * FROM $(table)';
      expect(handler.hasVariables(sql)).toBe(true);
    });

    it('should detect multiple variables', () => {
      const sql = 'SELECT $(column) FROM $(table) WHERE id = $(id)';
      expect(handler.hasVariables(sql)).toBe(true);
    });

    it('should return false for SQL without variables', () => {
      const sql = 'SELECT * FROM users';
      expect(handler.hasVariables(sql)).toBe(false);
    });

    it('should handle empty SQL', () => {
      expect(handler.hasVariables('')).toBe(false);
    });

    it('should handle malformed variables', () => {
      const sql = 'SELECT * FROM $(table';
      // Incomplete variable syntax
      expect(handler.hasVariables(sql)).toBe(false);
    });
  });

  describe('extractVariables()', () => {
    it('should extract single variable', () => {
      const sql = 'SELECT * FROM $(table)';
      const variables = handler.extractVariables(sql);
      
      expect(variables).toEqual(['table']);
    });

    it('should extract multiple variables', () => {
      const sql = 'SELECT $(column) FROM $(table) WHERE id = $(id)';
      const variables = handler.extractVariables(sql);
      
      expect(variables).toEqual(['column', 'table', 'id']);
    });

    it('should extract duplicate variables', () => {
      const sql = 'SELECT * FROM $(table) JOIN $(table)';
      const variables = handler.extractVariables(sql);
      
      expect(variables).toEqual(['table', 'table']);
    });

    it('should return empty array for SQL without variables', () => {
      const sql = 'SELECT * FROM users';
      const variables = handler.extractVariables(sql);
      
      expect(variables).toEqual([]);
    });

    it('should handle variables with underscores', () => {
      const sql = 'SELECT * FROM $(table_name)';
      const variables = handler.extractVariables(sql);
      
      expect(variables).toEqual(['table_name']);
    });

    it('should handle variables with numbers', () => {
      const sql = 'SELECT * FROM $(table1)';
      const variables = handler.extractVariables(sql);
      
      expect(variables).toEqual(['table1']);
    });

    it('should handle empty SQL', () => {
      const variables = handler.extractVariables('');
      expect(variables).toEqual([]);
    });
  });

  describe('escapeVariables()', () => {
    it('should escape single variable', () => {
      const sql = 'SELECT * FROM $(table)';
      const result = handler.escapeVariables(sql);
      
      expect(result.escapedSql).toContain('${placeholder}_0');
      expect(result.variableMap['${placeholder}_0']).toBe('$(table)');
    });

    it('should escape multiple variables', () => {
      const sql = 'SELECT $(column) FROM $(table) WHERE id = $(id)';
      const result = handler.escapeVariables(sql);
      
      expect(result.escapedSql).toContain('${placeholder}_0');
      expect(result.escapedSql).toContain('${placeholder}_1');
      expect(result.escapedSql).toContain('${placeholder}_2');
      expect(Object.keys(result.variableMap)).toHaveLength(3);
    });

    it('should create unique placeholders for each variable', () => {
      const sql = 'SELECT * FROM $(table1) JOIN $(table2)';
      const result = handler.escapeVariables(sql);
      
      expect(result.variableMap['${placeholder}_0']).toBe('$(table1)');
      expect(result.variableMap['${placeholder}_1']).toBe('$(table2)');
    });

    it('should handle duplicate variables', () => {
      const sql = 'SELECT * FROM $(table) JOIN $(table)';
      const result = handler.escapeVariables(sql);
      
      // Each occurrence gets a unique placeholder
      expect(Object.keys(result.variableMap)).toHaveLength(2);
    });

    it('should not modify SQL without variables', () => {
      const sql = 'SELECT * FROM users';
      const result = handler.escapeVariables(sql);
      
      expect(result.escapedSql).toBe(sql);
      expect(Object.keys(result.variableMap)).toHaveLength(0);
    });

    it('should handle empty SQL', () => {
      const result = handler.escapeVariables('');
      
      expect(result.escapedSql).toBe('');
      expect(Object.keys(result.variableMap)).toHaveLength(0);
    });
  });

  describe('revertEscapedSql()', () => {
    it('should revert escaped SQL to original', () => {
      const originalSql = 'SELECT * FROM $(table)';
      const escaped = handler.escapeVariables(originalSql);
      const reverted = handler.revertEscapedSql(
        escaped.escapedSql,
        escaped.variableMap
      );
      
      expect(reverted).toBe(originalSql);
    });

    it('should revert multiple variables', () => {
      const originalSql = 'SELECT $(column) FROM $(table) WHERE id = $(id)';
      const escaped = handler.escapeVariables(originalSql);
      const reverted = handler.revertEscapedSql(
        escaped.escapedSql,
        escaped.variableMap
      );
      
      expect(reverted).toBe(originalSql);
    });

    it('should handle SQL without variables', () => {
      const sql = 'SELECT * FROM users';
      const reverted = handler.revertEscapedSql(sql, {});
      
      expect(reverted).toBe(sql);
    });

    it('should preserve SQL structure', () => {
      const originalSql = `SELECT 
  $(col1),
  $(col2)
FROM $(table)
WHERE id = $(id)`;
      
      const escaped = handler.escapeVariables(originalSql);
      const reverted = handler.revertEscapedSql(
        escaped.escapedSql,
        escaped.variableMap
      );
      
      expect(reverted).toBe(originalSql);
    });
  });

  describe('revertErrorPositions()', () => {
    it('should adjust error positions after variable escaping', () => {
      const originalSql = 'SELECT * FROM $(table) WHERE';
      const escaped = handler.escapeVariables(originalSql);
      
      const errors = [
        {
          startLine: 0,
          startColumn: 20,
          endLine: 0,
          endColumn: 25,
          message: 'Syntax error',
        },
      ];

      const adjustedErrors = handler.revertErrorPositions(
        errors,
        originalSql,
        escaped.escapedSql,
        escaped.variableMap
      );

      expect(adjustedErrors).toHaveLength(1);
      expect(adjustedErrors[0]).toBeDefined();
    });

    it('should handle errors without column information', () => {
      const originalSql = 'SELECT * FROM $(table)';
      const escaped = handler.escapeVariables(originalSql);
      
      const errors = [
        {
          message: 'Generic error',
        },
      ];

      const adjustedErrors = handler.revertErrorPositions(
        errors,
        originalSql,
        escaped.escapedSql,
        escaped.variableMap
      );

      expect(adjustedErrors).toHaveLength(1);
      expect(adjustedErrors[0].message).toBe('Generic error');
    });

    it('should handle empty error list', () => {
      const originalSql = 'SELECT * FROM $(table)';
      const escaped = handler.escapeVariables(originalSql);
      
      const adjustedErrors = handler.revertErrorPositions(
        [],
        originalSql,
        escaped.escapedSql,
        escaped.variableMap
      );

      expect(adjustedErrors).toEqual([]);
    });

    it('should preserve error properties', () => {
      const originalSql = 'SELECT * FROM $(table) WHERE';
      const escaped = handler.escapeVariables(originalSql);
      
      const errors = [
        {
          startLine: 0,
          startColumn: 20,
          endLine: 0,
          endColumn: 25,
          message: 'Syntax error',
          severity: 'error' as const,
          customProp: 'test',
        },
      ];

      const adjustedErrors = handler.revertErrorPositions(
        errors,
        originalSql,
        escaped.escapedSql,
        escaped.variableMap
      );

      expect(adjustedErrors[0].message).toBe('Syntax error');
      expect(adjustedErrors[0].severity).toBe('error');
      expect((adjustedErrors[0] as any).customProp).toBe('test');
    });
  });

  describe('Round-trip tests', () => {
    it('should handle complete escape-parse-revert cycle', () => {
      const originalSql = 'SELECT $(col) FROM $(table) WHERE $(condition)';
      
      // Escape
      const escaped = handler.escapeVariables(originalSql);
      
      // Revert
      const reverted = handler.revertEscapedSql(
        escaped.escapedSql,
        escaped.variableMap
      );
      
      expect(reverted).toBe(originalSql);
    });

    it('should handle complex SQL with variables', () => {
      const originalSql = `
        SELECT $(col1), $(col2)
        FROM $(table1) t1
        LEFT JOIN $(table2) t2 ON t1.id = t2.$(fk)
        WHERE $(condition)
        GROUP BY $(group_col)
        ORDER BY $(order_col)
      `.trim();
      
      const escaped = handler.escapeVariables(originalSql);
      const reverted = handler.revertEscapedSql(
        escaped.escapedSql,
        escaped.variableMap
      );
      
      expect(reverted).toBe(originalSql);
    });
  });

  describe('Edge cases', () => {
    it('should handle nested parentheses', () => {
      const sql = 'SELECT CONCAT($(col1), $(col2))';
      const variables = handler.extractVariables(sql);
      
      expect(variables).toEqual(['col1', 'col2']);
    });

    it('should handle variables in string literals (edge case)', () => {
      // Variables inside quotes should still be detected
      const sql = "SELECT '$(value)' FROM users";
      const variables = handler.extractVariables(sql);
      
      expect(variables).toEqual(['value']);
    });

    it('should handle special characters in variable names', () => {
      const sql = 'SELECT * FROM $(table_name_123)';
      const variables = handler.extractVariables(sql);
      
      expect(variables).toEqual(['table_name_123']);
    });

    it('should handle consecutive variables', () => {
      const sql = 'SELECT $(col1)$(col2) FROM users';
      const variables = handler.extractVariables(sql);
      
      expect(variables).toEqual(['col1', 'col2']);
    });

    it('should handle variables at start and end', () => {
      const sql = '$(start) SELECT * FROM users $(end)';
      const variables = handler.extractVariables(sql);
      
      expect(variables).toEqual(['start', 'end']);
    });

    it('should handle very long variable names', () => {
      const longName = 'very_long_variable_name_with_many_characters_123';
      const sql = `SELECT * FROM $(${longName})`;
      const variables = handler.extractVariables(sql);
      
      expect(variables).toEqual([longName]);
    });
  });
});

