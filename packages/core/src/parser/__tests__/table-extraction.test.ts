/**
 * Table Extraction Tests
 * Tests that table references are extracted correctly from various SQL patterns
 */

import { ParserService } from '../parser-service';

describe('Table Reference Extraction', () => {
  let parser: ParserService;

  beforeEach(() => {
    parser = new ParserService('mysql');
  });

  describe('Simple FROM clause', () => {
    it('should extract table without alias', () => {
      const sql = 'SELECT * FROM users';
      const result = parser.parse(sql);

      expect(result.tableRefs).toBeDefined();
      expect(result.tableRefs.length).toBeGreaterThanOrEqual(1);
      expect(result.tableRefs.some(t => t.name === 'users')).toBe(true);
    });

    it('should extract table with alias', () => {
      const sql = 'SELECT * FROM users u';
      const result = parser.parse(sql);

      expect(result.tableRefs.length).toBeGreaterThanOrEqual(1);
      const usersTable = result.tableRefs.find(t => t.name === 'users');
      expect(usersTable).toBeDefined();
      expect(usersTable?.alias).toBe('u');
    });

    it('should extract table with AS alias', () => {
      const sql = 'SELECT * FROM users AS u';
      const result = parser.parse(sql);

      expect(result.tableRefs.length).toBeGreaterThanOrEqual(1);
      const usersTable = result.tableRefs.find(t => t.name === 'users');
      expect(usersTable).toBeDefined();
      expect(usersTable?.alias).toBe('u');
    });
  });

  describe('JOIN clauses', () => {
    it('should extract INNER JOIN table', () => {
      const sql = 'SELECT * FROM users u INNER JOIN orders o ON u.id = o.user_id';
      const result = parser.parse(sql);

      expect(result.tableRefs.length).toBeGreaterThanOrEqual(2);
      expect(result.tableRefs.some(t => t.name === 'users' && t.alias === 'u')).toBe(true);
      expect(result.tableRefs.some(t => t.name === 'orders' && t.alias === 'o')).toBe(true);
    });

    it('should extract LEFT JOIN table', () => {
      const sql = 'SELECT * FROM users u LEFT JOIN orders o ON u.id = o.user_id';
      const result = parser.parse(sql);

      expect(result.tableRefs.length).toBeGreaterThanOrEqual(2);
      expect(result.tableRefs.some(t => t.name === 'orders' && t.alias === 'o')).toBe(true);
    });

    it('should extract RIGHT JOIN table', () => {
      const sql = 'SELECT * FROM users u RIGHT JOIN orders o ON u.id = o.user_id';
      const result = parser.parse(sql);

      expect(result.tableRefs.length).toBeGreaterThanOrEqual(2);
      expect(result.tableRefs.some(t => t.name === 'orders' && t.alias === 'o')).toBe(true);
    });

    it('should extract simple JOIN table', () => {
      const sql = 'SELECT * FROM users u JOIN orders o ON u.id = o.user_id';
      const result = parser.parse(sql);

      expect(result.tableRefs.length).toBeGreaterThanOrEqual(2);
      expect(result.tableRefs.some(t => t.name === 'users' && t.alias === 'u')).toBe(true);
      expect(result.tableRefs.some(t => t.name === 'orders' && t.alias === 'o')).toBe(true);
    });

    it('should extract multiple JOINs', () => {
      const sql = `
        SELECT * 
        FROM users u 
        JOIN orders o ON u.id = o.user_id
        JOIN products p ON o.product_id = p.id
      `;
      const result = parser.parse(sql);

      expect(result.tableRefs.length).toBeGreaterThanOrEqual(3);
      expect(result.tableRefs.some(t => t.name === 'users' && t.alias === 'u')).toBe(true);
      expect(result.tableRefs.some(t => t.name === 'orders' && t.alias === 'o')).toBe(true);
      expect(result.tableRefs.some(t => t.name === 'products' && t.alias === 'p')).toBe(true);
    });
  });

  describe('Alias mapping', () => {
    it('should create correct alias map', () => {
      const sql = 'SELECT * FROM users u JOIN orders o ON u.id = o.user_id';
      const result = parser.parse(sql);

      expect(result.aliases).toBeDefined();
      expect(result.aliases['u']).toBeDefined();
      expect(result.aliases['u'].name).toBe('users');
      expect(result.aliases['o']).toBeDefined();
      expect(result.aliases['o'].name).toBe('orders');
    });

    it('should map table name to itself', () => {
      const sql = 'SELECT * FROM users';
      const result = parser.parse(sql);

      expect(result.aliases['users']).toBeDefined();
      expect(result.aliases['users'].name).toBe('users');
    });
  });

  describe('Complex queries', () => {
    it('should extract from multi-line SQL', () => {
      const sql = `
        SELECT 
          u.username,
          o.total
        FROM users u
        LEFT JOIN orders o ON u.id = o.user_id
        WHERE u.status = 'active'
      `;
      const result = parser.parse(sql);

      expect(result.tableRefs.length).toBeGreaterThanOrEqual(2);
      expect(result.tableRefs.some(t => t.name === 'users')).toBe(true);
      expect(result.tableRefs.some(t => t.name === 'orders')).toBe(true);
    });

    it('should handle subqueries', () => {
      const sql = 'SELECT * FROM (SELECT * FROM users u) subquery';
      const result = parser.parse(sql);

      // Should at least extract the inner table
      expect(result.tableRefs.some(t => t.name === 'users')).toBe(true);
    });
  });
});

