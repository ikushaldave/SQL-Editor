/**
 * Schema-related types
 * @packageDocumentation
 */

/**
 * Column data types
 */
export type ColumnType =
  | 'int' | 'bigint' | 'smallint' | 'tinyint'
  | 'decimal' | 'numeric' | 'float' | 'double'
  | 'varchar' | 'char' | 'text'
  | 'date' | 'datetime' | 'timestamp' | 'time'
  | 'boolean' | 'bool'
  | 'json' | 'jsonb'
  | 'blob' | 'binary'
  | 'uuid'
  | 'enum'
  | string; // Allow custom types

/**
 * Column definition
 */
export interface ColumnDefinition {
  /** Column data type */
  type: ColumnType;
  /** Whether column is nullable */
  nullable?: boolean;
  /** Whether column is primary key */
  primaryKey?: boolean;
  /** Foreign key reference (table.column) */
  foreignKey?: string;
  /** Default value */
  defaultValue?: any;
  /** Column length (for varchar, char) */
  length?: number;
  /** Precision (for decimal, numeric) */
  precision?: number;
  /** Scale (for decimal, numeric) */
  scale?: number;
  /** Enum values */
  enumValues?: string[];
  /** Column comment/description */
  comment?: string;
  /** Whether column is auto-increment */
  autoIncrement?: boolean;
  /** Whether column is unique */
  unique?: boolean;
}

/**
 * Table definition
 */
export interface TableDefinition {
  /** Table name */
  name: string;
  /** Table columns */
  columns: Record<string, ColumnDefinition>;
  /** Table comment/description */
  comment?: string;
  /** Primary key columns */
  primaryKeys?: string[];
  /** Foreign keys */
  foreignKeys?: ForeignKeyDefinition[];
  /** Indexes */
  indexes?: IndexDefinition[];
}

/**
 * Foreign key definition
 */
export interface ForeignKeyDefinition {
  /** Column name in this table */
  column: string;
  /** Referenced table */
  referencedTable: string;
  /** Referenced column */
  referencedColumn: string;
  /** On delete action */
  onDelete?: 'CASCADE' | 'SET NULL' | 'RESTRICT' | 'NO ACTION';
  /** On update action */
  onUpdate?: 'CASCADE' | 'SET NULL' | 'RESTRICT' | 'NO ACTION';
}

/**
 * Index definition
 */
export interface IndexDefinition {
  /** Index name */
  name: string;
  /** Columns in the index */
  columns: string[];
  /** Whether index is unique */
  unique?: boolean;
  /** Index type */
  type?: 'BTREE' | 'HASH' | 'FULLTEXT' | 'SPATIAL';
}

/**
 * Database definition
 */
export interface DatabaseDefinition {
  /** Database name */
  name: string;
  /** Tables in the database */
  tables: Record<string, TableDefinition>;
  /** Database comment/description */
  comment?: string;
}

/**
 * Full schema definition
 */
export interface SchemaDefinition {
  /** Databases in the schema */
  databases: Record<string, DatabaseDefinition>;
}

/**
 * Schema item (for search results)
 */
export interface SchemaItem {
  /** Item type */
  type: 'database' | 'table' | 'column';
  /** Item name */
  name: string;
  /** Database name (for tables and columns) */
  database?: string;
  /** Table name (for columns) */
  table?: string;
  /** Additional details */
  detail?: string;
  /** Item definition */
  definition?: TableDefinition | ColumnDefinition;
}

