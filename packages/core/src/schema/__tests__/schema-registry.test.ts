/**
 * Schema Registry Tests
 */

import { SchemaRegistry } from '../schema-registry';
import type { SchemaDefinition } from '../../types/schema';

describe('SchemaRegistry', () => {
  let registry: SchemaRegistry;
  let sampleSchema: SchemaDefinition;

  beforeEach(() => {
    registry = new SchemaRegistry();
    
    sampleSchema = {
      databases: {
        testdb: {
          name: 'testdb',
          tables: {
            users: {
              name: 'users',
              columns: {
                id: { type: 'int', primaryKey: true },
                name: { type: 'varchar', length: 255 },
                email: { type: 'varchar', length: 255 },
              },
            },
            orders: {
              name: 'orders',
              columns: {
                id: { type: 'int', primaryKey: true },
                user_id: { type: 'int', foreignKey: 'users.id' },
                total: { type: 'decimal', precision: 10, scale: 2 },
              },
            },
          },
        },
      },
    };
  });

  describe('registerSchema', () => {
    it('should register a schema', () => {
      registry.registerSchema(sampleSchema);
      const db = registry.getDatabase('testdb');
      expect(db).toBeDefined();
      expect(db?.name).toBe('testdb');
    });
  });

  describe('getDatabase', () => {
    beforeEach(() => {
      registry.registerSchema(sampleSchema);
    });

    it('should get a database by name', () => {
      const db = registry.getDatabase('testdb');
      expect(db).toBeDefined();
      expect(db?.name).toBe('testdb');
    });

    it('should return null for non-existent database', () => {
      const db = registry.getDatabase('nonexistent');
      expect(db).toBeNull();
    });

    it('should handle case-insensitive lookups when configured', () => {
      const db = registry.getDatabase('TESTDB');
      expect(db).toBeDefined();
    });
  });

  describe('getTable', () => {
    beforeEach(() => {
      registry.registerSchema(sampleSchema);
    });

    it('should get a table by name', () => {
      const table = registry.getTable('users');
      expect(table).toBeDefined();
      expect(table?.name).toBe('users');
    });

    it('should get a table with database qualifier', () => {
      const table = registry.getTable('users', 'testdb');
      expect(table).toBeDefined();
      expect(table?.name).toBe('users');
    });

    it('should return null for non-existent table', () => {
      const table = registry.getTable('nonexistent');
      expect(table).toBeNull();
    });
  });

  describe('getColumns', () => {
    beforeEach(() => {
      registry.registerSchema(sampleSchema);
    });

    it('should get columns for a table', () => {
      const columns = registry.getColumns('users');
      expect(columns).toHaveLength(3);
      expect(columns[0]?.name).toBe('id');
      expect(columns[1]?.name).toBe('name');
      expect(columns[2]?.name).toBe('email');
    });

    it('should return empty array for non-existent table', () => {
      const columns = registry.getColumns('nonexistent');
      expect(columns).toEqual([]);
    });
  });

  describe('getAllTables', () => {
    beforeEach(() => {
      registry.registerSchema(sampleSchema);
    });

    it('should get all tables', () => {
      const tables = registry.getAllTables();
      expect(tables).toHaveLength(2);
      expect(tables.map(t => t.name)).toContain('users');
      expect(tables.map(t => t.name)).toContain('orders');
    });

    it('should filter tables by database', () => {
      const tables = registry.getAllTables('testdb');
      expect(tables).toHaveLength(2);
    });
  });

  describe('search', () => {
    beforeEach(() => {
      registry.registerSchema(sampleSchema);
    });

    it('should search for tables', () => {
      const results = registry.search('user');
      expect(results.length).toBeGreaterThan(0);
      expect(results.some(r => r.type === 'table' && r.name === 'users')).toBe(true);
    });

    it('should search for columns', () => {
      const results = registry.search('name');
      expect(results.length).toBeGreaterThan(0);
      expect(results.some(r => r.type === 'column' && r.name === 'name')).toBe(true);
    });

    it('should filter search by type', () => {
      const results = registry.search('user', { type: 'table' });
      expect(results.every(r => r.type === 'table')).toBe(true);
    });

    it('should limit search results', () => {
      const results = registry.search('', { limit: 1 });
      expect(results.length).toBeLessThanOrEqual(1);
    });
  });

  describe('clear', () => {
    it('should clear the registry', () => {
      registry.registerSchema(sampleSchema);
      expect(registry.getTable('users')).toBeDefined();
      
      registry.clear();
      expect(registry.getTable('users')).toBeNull();
    });
  });
});

