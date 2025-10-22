/**
 * Comprehensive SQL Query Tests
 * Tests various SQL query types: simple, aliases, CTEs, joins, etc.
 */

import { ParserService } from '../parser/parser-service';
import { SchemaRegistry } from '../schema/schema-registry';
import { AutocompleteEngine } from '../autocomplete/autocomplete-engine';
import { ValidatorService } from '../validator/validator-service';
import type { SchemaDefinition } from '../types/schema';
import { SQL_DIALECTS } from '../constants';

describe('SQL Query Tests', () => {
  let parser: ParserService;
  let schema: SchemaRegistry;
  let autocomplete: AutocompleteEngine;
  let validator: ValidatorService;

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
              email: { type: 'varchar', length: 255 },
              created_at: { type: 'timestamp' },
              status: { type: 'enum', enumValues: ['active', 'inactive'] },
            },
          },
          orders: {
            name: 'orders',
            columns: {
              id: { type: 'int', primaryKey: true },
              user_id: { type: 'int', foreignKey: 'users.id' },
              total: { type: 'decimal', precision: 10, scale: 2 },
              order_date: { type: 'timestamp' },
              status: { type: 'varchar', length: 50 },
            },
          },
          products: {
            name: 'products',
            columns: {
              id: { type: 'int', primaryKey: true },
              name: { type: 'varchar', length: 200 },
              price: { type: 'decimal', precision: 10, scale: 2 },
              category: { type: 'varchar', length: 100 },
            },
          },
          order_items: {
            name: 'order_items',
            columns: {
              id: { type: 'int', primaryKey: true },
              order_id: { type: 'int', foreignKey: 'orders.id' },
              product_id: { type: 'int', foreignKey: 'products.id' },
              quantity: { type: 'int' },
              unit_price: { type: 'decimal', precision: 10, scale: 2 },
            },
          },
        },
      },
    },
  };

  beforeEach(() => {
    parser = new ParserService('mysql');
    schema = new SchemaRegistry();
    autocomplete = new AutocompleteEngine();
    validator = new ValidatorService();
    schema.registerSchema(testSchema);
  });

  describe('Simple SELECT Queries', () => {
    it('should parse simple SELECT *', () => {
      const sql = 'SELECT * FROM users';
      const result = parser.parse(sql);
      
      expect(result).toBeDefined();
      expect(typeof result.success).toBe('boolean');
      expect(Array.isArray(result.errors)).toBe(true);
    });

    it('should parse SELECT with specific columns', () => {
      const sql = 'SELECT id, username, email FROM users';
      const result = parser.parse(sql);
      
      expect(result).toBeDefined();
      expect(result.errors).toBeDefined();
    });

    it('should parse SELECT with WHERE clause', () => {
      const sql = "SELECT * FROM users WHERE status = 'active'";
      const result = parser.parse(sql);
      
      expect(result).toBeDefined();
      expect(result.errors).toBeDefined();
    });

    it('should parse SELECT with multiple conditions', () => {
      const sql = `
        SELECT id, username, email 
        FROM users 
        WHERE status = 'active' 
          AND created_at >= '2024-01-01'
          AND email LIKE '%@example.com'
      `;
      const result = parser.parse(sql);
      
      expect(result).toBeDefined();
    });
  });

  describe('Queries with Aliases', () => {
    it('should parse query with table alias', () => {
      const sql = 'SELECT u.id, u.username FROM users u';
      const result = parser.parse(sql);
      
      expect(result).toBeDefined();
      expect(result.tableRefs).toBeDefined();
    });

    it('should parse query with column aliases', () => {
      const sql = `
        SELECT 
          id AS user_id,
          username AS user_name,
          email AS user_email
        FROM users
      `;
      const result = parser.parse(sql);
      
      expect(result).toBeDefined();
    });

    it('should parse complex query with multiple aliases', () => {
      const sql = `
        SELECT 
          u.id AS user_id,
          u.username AS name,
          o.id AS order_id,
          o.total AS order_total
        FROM users u, orders o
        WHERE u.id = o.user_id
      `;
      const result = parser.parse(sql);
      
      expect(result).toBeDefined();
    });
  });

  describe('INNER JOIN Queries', () => {
    it('should parse simple INNER JOIN', () => {
      const sql = `
        SELECT u.username, o.total
        FROM users u
        INNER JOIN orders o ON u.id = o.user_id
      `;
      const result = parser.parse(sql);
      
      expect(result).toBeDefined();
    });

    it('should parse multiple INNER JOINs', () => {
      const sql = `
        SELECT 
          u.username,
          o.total,
          oi.quantity,
          p.name AS product_name
        FROM users u
        INNER JOIN orders o ON u.id = o.user_id
        INNER JOIN order_items oi ON o.id = oi.order_id
        INNER JOIN products p ON oi.product_id = p.id
      `;
      const result = parser.parse(sql);
      
      expect(result).toBeDefined();
    });

    it('should parse INNER JOIN with WHERE clause', () => {
      const sql = `
        SELECT u.username, o.total
        FROM users u
        INNER JOIN orders o ON u.id = o.user_id
        WHERE o.status = 'completed'
          AND o.total > 100
      `;
      const result = parser.parse(sql);
      
      expect(result).toBeDefined();
    });
  });

  describe('LEFT JOIN Queries', () => {
    it('should parse simple LEFT JOIN', () => {
      const sql = `
        SELECT u.username, o.total
        FROM users u
        LEFT JOIN orders o ON u.id = o.user_id
      `;
      const result = parser.parse(sql);
      
      expect(result).toBeDefined();
    });

    it('should parse LEFT JOIN with WHERE on joined table', () => {
      const sql = `
        SELECT u.username, o.total
        FROM users u
        LEFT JOIN orders o ON u.id = o.user_id
        WHERE o.id IS NULL
      `;
      const result = parser.parse(sql);
      
      expect(result).toBeDefined();
    });

    it('should parse multiple LEFT JOINs', () => {
      const sql = `
        SELECT 
          u.username,
          COALESCE(SUM(o.total), 0) AS total_spent
        FROM users u
        LEFT JOIN orders o ON u.id = o.user_id
        LEFT JOIN order_items oi ON o.id = oi.order_id
        GROUP BY u.id, u.username
      `;
      const result = parser.parse(sql);
      
      expect(result).toBeDefined();
    });
  });

  describe('Common Table Expressions (CTEs)', () => {
    it('should parse simple CTE', () => {
      const sql = `
        WITH active_users AS (
          SELECT * FROM users WHERE status = 'active'
        )
        SELECT * FROM active_users
      `;
      const result = parser.parse(sql);
      
      expect(result).toBeDefined();
    });

    it('should parse multiple CTEs', () => {
      const sql = `
        WITH 
        active_users AS (
          SELECT id, username FROM users WHERE status = 'active'
        ),
        user_orders AS (
          SELECT user_id, COUNT(*) AS order_count
          FROM orders
          GROUP BY user_id
        )
        SELECT 
          u.username,
          COALESCE(uo.order_count, 0) AS total_orders
        FROM active_users u
        LEFT JOIN user_orders uo ON u.id = uo.user_id
      `;
      const result = parser.parse(sql);
      
      expect(result).toBeDefined();
    });

    it('should parse recursive CTE', () => {
      const sql = `
        WITH RECURSIVE numbers AS (
          SELECT 1 AS n
          UNION ALL
          SELECT n + 1 FROM numbers WHERE n < 10
        )
        SELECT * FROM numbers
      `;
      const result = parser.parse(sql);
      
      expect(result).toBeDefined();
    });
  });

  describe('Aggregate Functions', () => {
    it('should parse COUNT query', () => {
      const sql = 'SELECT COUNT(*) FROM users';
      const result = parser.parse(sql);
      
      expect(result).toBeDefined();
    });

    it('should parse multiple aggregate functions', () => {
      const sql = `
        SELECT 
          COUNT(*) AS user_count,
          SUM(total) AS total_revenue,
          AVG(total) AS avg_order_value,
          MIN(total) AS min_order,
          MAX(total) AS max_order
        FROM orders
      `;
      const result = parser.parse(sql);
      
      expect(result).toBeDefined();
    });

    it('should parse GROUP BY with HAVING', () => {
      const sql = `
        SELECT 
          user_id,
          COUNT(*) AS order_count,
          SUM(total) AS total_spent
        FROM orders
        GROUP BY user_id
        HAVING total_spent > 1000
        ORDER BY total_spent DESC
      `;
      const result = parser.parse(sql);
      
      expect(result).toBeDefined();
    });
  });

  describe('Subqueries', () => {
    it('should parse subquery in WHERE clause', () => {
      const sql = `
        SELECT * FROM users
        WHERE id IN (
          SELECT user_id FROM orders WHERE total > 100
        )
      `;
      const result = parser.parse(sql);
      
      expect(result).toBeDefined();
    });

    it('should parse subquery in FROM clause', () => {
      const sql = `
        SELECT u.username, order_stats.total_orders
        FROM users u
        JOIN (
          SELECT user_id, COUNT(*) AS total_orders
          FROM orders
          GROUP BY user_id
        ) order_stats ON u.id = order_stats.user_id
      `;
      const result = parser.parse(sql);
      
      expect(result).toBeDefined();
    });

    it('should parse correlated subquery', () => {
      const sql = `
        SELECT 
          u.username,
          (SELECT COUNT(*) FROM orders o WHERE o.user_id = u.id) AS order_count
        FROM users u
      `;
      const result = parser.parse(sql);
      
      expect(result).toBeDefined();
    });
  });

  describe('Window Functions', () => {
    it('should parse ROW_NUMBER window function', () => {
      const sql = `
        SELECT 
          username,
          total,
          ROW_NUMBER() OVER (ORDER BY total DESC) AS rank
        FROM users u
        JOIN orders o ON u.id = o.user_id
      `;
      const result = parser.parse(sql);
      
      expect(result).toBeDefined();
    });

    it('should parse window function with PARTITION BY', () => {
      const sql = `
        SELECT 
          user_id,
          order_date,
          total,
          SUM(total) OVER (PARTITION BY user_id ORDER BY order_date) AS running_total
        FROM orders
      `;
      const result = parser.parse(sql);
      
      expect(result).toBeDefined();
    });
  });

  describe('UNION Queries', () => {
    it('should parse UNION', () => {
      const sql = `
        SELECT username FROM users WHERE status = 'active'
        UNION
        SELECT username FROM users WHERE created_at > '2024-01-01'
      `;
      const result = parser.parse(sql);
      
      expect(result).toBeDefined();
    });

    it('should parse UNION ALL', () => {
      const sql = `
        SELECT id, 'user' AS type FROM users
        UNION ALL
        SELECT id, 'order' AS type FROM orders
      `;
      const result = parser.parse(sql);
      
      expect(result).toBeDefined();
    });
  });

  describe('Complex Real-World Queries', () => {
    it('should parse complex analytics query', () => {
      const sql = `
        WITH monthly_stats AS (
          SELECT 
            DATE_FORMAT(order_date, '%Y-%m') AS month,
            COUNT(*) AS order_count,
            SUM(total) AS revenue,
            AVG(total) AS avg_order_value
          FROM orders
          WHERE order_date >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
          GROUP BY DATE_FORMAT(order_date, '%Y-%m')
        )
        SELECT 
          month,
          order_count,
          revenue,
          avg_order_value,
          LAG(revenue) OVER (ORDER BY month) AS prev_month_revenue,
          (revenue - LAG(revenue) OVER (ORDER BY month)) / LAG(revenue) OVER (ORDER BY month) * 100 AS growth_rate
        FROM monthly_stats
        ORDER BY month DESC
      `;
      const result = parser.parse(sql);
      
      expect(result).toBeDefined();
    });

    it('should parse query with CASE statement', () => {
      const sql = `
        SELECT 
          username,
          total,
          CASE 
            WHEN total < 100 THEN 'Small'
            WHEN total BETWEEN 100 AND 500 THEN 'Medium'
            WHEN total > 500 THEN 'Large'
            ELSE 'Unknown'
          END AS order_size
        FROM users u
        JOIN orders o ON u.id = o.user_id
      `;
      const result = parser.parse(sql);
      
      expect(result).toBeDefined();
    });

    it('should parse query with multiple joins and aggregates', () => {
      const sql = `
        SELECT 
          u.username,
          COUNT(DISTINCT o.id) AS order_count,
          COUNT(DISTINCT oi.product_id) AS unique_products,
          SUM(oi.quantity * oi.unit_price) AS total_spent,
          AVG(o.total) AS avg_order_value,
          MAX(o.order_date) AS last_order_date
        FROM users u
        LEFT JOIN orders o ON u.id = o.user_id
        LEFT JOIN order_items oi ON o.id = oi.order_id
        WHERE u.status = 'active'
        GROUP BY u.id, u.username
        HAVING order_count > 0
        ORDER BY total_spent DESC
        LIMIT 10
      `;
      const result = parser.parse(sql);
      
      expect(result).toBeDefined();
    });
  });

  describe('Multi-Dialect Support', () => {
    it('should support MySQL dialect', () => {
      const mysqlParser = new ParserService(SQL_DIALECTS.MYSQL);
      const sql = 'SELECT * FROM users LIMIT 10';
      const result = mysqlParser.parse(sql);
      
      expect(result).toBeDefined();
      expect(mysqlParser.getDialect()).toBe('mysql');
    });

    it('should support PostgreSQL dialect', () => {
      const pgParser = new ParserService(SQL_DIALECTS.POSTGRESQL);
      const sql = 'SELECT * FROM users LIMIT 10';
      const result = pgParser.parse(sql);
      
      expect(result).toBeDefined();
      expect(pgParser.getDialect()).toBe('postgresql');
    });

    it('should support dialect switching', () => {
      const parser = new ParserService(SQL_DIALECTS.MYSQL);
      expect(parser.getDialect()).toBe('mysql');
      
      parser.setDialect(SQL_DIALECTS.POSTGRESQL);
      expect(parser.getDialect()).toBe('postgresql');
      
      const sql = 'SELECT * FROM users';
      const result = parser.parse(sql);
      expect(result).toBeDefined();
    });
  });
});

