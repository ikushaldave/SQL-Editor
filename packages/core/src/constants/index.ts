/**
 * Constants for SQL Editor
 * @packageDocumentation
 */

/**
 * Supported SQL dialects
 */
export const SQL_DIALECTS = {
  MYSQL: 'mysql',
  POSTGRESQL: 'postgresql',
  FLINK: 'flink',
  SPARK: 'spark',
  HIVE: 'hive',
  TRINO: 'trino',
  IMPALA: 'impala',
} as const;

export type SQLDialectType = typeof SQL_DIALECTS[keyof typeof SQL_DIALECTS];

/**
 * SQL Keywords by category
 */
export const SQL_KEYWORDS = {
  // DML (Data Manipulation Language)
  DML: [
    'SELECT',
    'INSERT',
    'UPDATE',
    'DELETE',
    'MERGE',
  ],
  
  // DDL (Data Definition Language)
  DDL: [
    'CREATE',
    'ALTER',
    'DROP',
    'TRUNCATE',
    'RENAME',
  ],
  
  // DCL (Data Control Language)
  DCL: [
    'GRANT',
    'REVOKE',
  ],
  
  // TCL (Transaction Control Language)
  TCL: [
    'COMMIT',
    'ROLLBACK',
    'SAVEPOINT',
  ],
  
  // Clauses
  CLAUSES: [
    'FROM',
    'WHERE',
    'GROUP BY',
    'HAVING',
    'ORDER BY',
    'LIMIT',
    'OFFSET',
    'UNION',
    'INTERSECT',
    'EXCEPT',
  ],
  
  // Joins
  JOINS: [
    'JOIN',
    'INNER JOIN',
    'LEFT JOIN',
    'RIGHT JOIN',
    'FULL JOIN',
    'CROSS JOIN',
    'LEFT OUTER JOIN',
    'RIGHT OUTER JOIN',
    'FULL OUTER JOIN',
  ],
  
  // CTEs
  CTE: [
    'WITH',
    'RECURSIVE',
  ],
  
  // Logical Operators
  LOGICAL: [
    'AND',
    'OR',
    'NOT',
    'IN',
    'EXISTS',
    'BETWEEN',
    'LIKE',
    'IS NULL',
    'IS NOT NULL',
  ],
  
  // Other Keywords
  OTHER: [
    'AS',
    'ON',
    'DISTINCT',
    'ALL',
    'ASC',
    'DESC',
    'CASE',
    'WHEN',
    'THEN',
    'ELSE',
    'END',
    'CAST',
    'OVER',
    'PARTITION BY',
    'WINDOW',
  ],
} as const;

/**
 * All SQL keywords flattened
 */
export const ALL_SQL_KEYWORDS = [
  ...SQL_KEYWORDS.DML,
  ...SQL_KEYWORDS.DDL,
  ...SQL_KEYWORDS.DCL,
  ...SQL_KEYWORDS.TCL,
  ...SQL_KEYWORDS.CLAUSES,
  ...SQL_KEYWORDS.JOINS,
  ...SQL_KEYWORDS.CTE,
  ...SQL_KEYWORDS.LOGICAL,
  ...SQL_KEYWORDS.OTHER,
];

/**
 * SQL Functions by category
 */
export const SQL_FUNCTIONS = {
  // Aggregate Functions
  AGGREGATE: [
    { name: 'COUNT', signature: 'COUNT(*) | COUNT(column)', description: 'Returns the number of rows' },
    { name: 'SUM', signature: 'SUM(column)', description: 'Returns the sum of values' },
    { name: 'AVG', signature: 'AVG(column)', description: 'Returns the average value' },
    { name: 'MIN', signature: 'MIN(column)', description: 'Returns the minimum value' },
    { name: 'MAX', signature: 'MAX(column)', description: 'Returns the maximum value' },
    { name: 'GROUP_CONCAT', signature: 'GROUP_CONCAT(column)', description: 'Concatenates values from multiple rows' },
  ],
  
  // String Functions
  STRING: [
    { name: 'CONCAT', signature: 'CONCAT(str1, str2, ...)', description: 'Concatenates strings' },
    { name: 'SUBSTRING', signature: 'SUBSTRING(str, pos, len)', description: 'Extracts a substring' },
    { name: 'UPPER', signature: 'UPPER(str)', description: 'Converts to uppercase' },
    { name: 'LOWER', signature: 'LOWER(str)', description: 'Converts to lowercase' },
    { name: 'TRIM', signature: 'TRIM(str)', description: 'Removes leading/trailing spaces' },
    { name: 'LENGTH', signature: 'LENGTH(str)', description: 'Returns string length' },
    { name: 'REPLACE', signature: 'REPLACE(str, from, to)', description: 'Replaces substring' },
  ],
  
  // Date/Time Functions
  DATETIME: [
    { name: 'NOW', signature: 'NOW()', description: 'Returns current date and time' },
    { name: 'CURDATE', signature: 'CURDATE()', description: 'Returns current date' },
    { name: 'CURTIME', signature: 'CURTIME()', description: 'Returns current time' },
    { name: 'DATE', signature: 'DATE(datetime)', description: 'Extracts date part' },
    { name: 'YEAR', signature: 'YEAR(date)', description: 'Extracts year' },
    { name: 'MONTH', signature: 'MONTH(date)', description: 'Extracts month' },
    { name: 'DAY', signature: 'DAY(date)', description: 'Extracts day' },
    { name: 'DATE_ADD', signature: 'DATE_ADD(date, INTERVAL value unit)', description: 'Adds interval to date' },
    { name: 'DATE_SUB', signature: 'DATE_SUB(date, INTERVAL value unit)', description: 'Subtracts interval from date' },
    { name: 'DATEDIFF', signature: 'DATEDIFF(date1, date2)', description: 'Returns difference in days' },
  ],
  
  // Mathematical Functions
  MATH: [
    { name: 'ROUND', signature: 'ROUND(number, decimals)', description: 'Rounds a number' },
    { name: 'CEIL', signature: 'CEIL(number)', description: 'Rounds up' },
    { name: 'FLOOR', signature: 'FLOOR(number)', description: 'Rounds down' },
    { name: 'ABS', signature: 'ABS(number)', description: 'Returns absolute value' },
    { name: 'POWER', signature: 'POWER(base, exponent)', description: 'Raises to power' },
    { name: 'SQRT', signature: 'SQRT(number)', description: 'Returns square root' },
  ],
  
  // Conditional Functions
  CONDITIONAL: [
    { name: 'IF', signature: 'IF(condition, true_value, false_value)', description: 'Conditional expression' },
    { name: 'IFNULL', signature: 'IFNULL(value, default)', description: 'Returns default if NULL' },
    { name: 'COALESCE', signature: 'COALESCE(value1, value2, ...)', description: 'Returns first non-NULL value' },
    { name: 'NULLIF', signature: 'NULLIF(value1, value2)', description: 'Returns NULL if values are equal' },
  ],
  
  // Window Functions
  WINDOW: [
    { name: 'ROW_NUMBER', signature: 'ROW_NUMBER() OVER(...)', description: 'Sequential row number' },
    { name: 'RANK', signature: 'RANK() OVER(...)', description: 'Rank with gaps' },
    { name: 'DENSE_RANK', signature: 'DENSE_RANK() OVER(...)', description: 'Rank without gaps' },
    { name: 'LAG', signature: 'LAG(column, offset) OVER(...)', description: 'Access previous row' },
    { name: 'LEAD', signature: 'LEAD(column, offset) OVER(...)', description: 'Access next row' },
  ],
} as const;

/**
 * All SQL functions flattened
 */
export const ALL_SQL_FUNCTIONS = [
  ...SQL_FUNCTIONS.AGGREGATE,
  ...SQL_FUNCTIONS.STRING,
  ...SQL_FUNCTIONS.DATETIME,
  ...SQL_FUNCTIONS.MATH,
  ...SQL_FUNCTIONS.CONDITIONAL,
  ...SQL_FUNCTIONS.WINDOW,
];

/**
 * SQL data types
 */
export const SQL_DATA_TYPES = {
  // Numeric Types
  NUMERIC: [
    'INT',
    'INTEGER',
    'BIGINT',
    'SMALLINT',
    'TINYINT',
    'DECIMAL',
    'NUMERIC',
    'FLOAT',
    'DOUBLE',
    'REAL',
  ],
  
  // String Types
  STRING: [
    'CHAR',
    'VARCHAR',
    'TEXT',
    'TINYTEXT',
    'MEDIUMTEXT',
    'LONGTEXT',
  ],
  
  // Date/Time Types
  DATETIME: [
    'DATE',
    'TIME',
    'DATETIME',
    'TIMESTAMP',
    'YEAR',
  ],
  
  // Binary Types
  BINARY: [
    'BINARY',
    'VARBINARY',
    'BLOB',
    'TINYBLOB',
    'MEDIUMBLOB',
    'LONGBLOB',
  ],
  
  // Other Types
  OTHER: [
    'BOOLEAN',
    'BOOL',
    'ENUM',
    'SET',
    'JSON',
    'UUID',
  ],
} as const;

/**
 * Context types for autocomplete
 */
export const CONTEXT_TYPES = {
  SELECT_LIST: 'select_list',
  FROM_CLAUSE: 'from_clause',
  WHERE_CLAUSE: 'where_clause',
  JOIN_CLAUSE: 'join_clause',
  GROUP_BY: 'group_by',
  ORDER_BY: 'order_by',
  HAVING: 'having',
  LIMIT: 'limit',
  FUNCTION: 'function',
  CTE: 'cte',
  UNKNOWN: 'unknown',
} as const;

/**
 * Autocomplete trigger characters
 */
export const AUTOCOMPLETE_TRIGGERS = {
  DOT: '.',
  SPACE: ' ',
  OPEN_PAREN: '(',
  COMMA: ',',
  DOLLAR: '$', // For variables
} as const;

// Note: DEFAULT_AUTOCOMPLETE_OPTIONS and DEFAULT_VALIDATION_OPTIONS
// are exported from types/autocomplete.ts and types/config.ts respectively

/**
 * Editor themes
 */
export const EDITOR_THEMES = {
  MONOKAI: 'monokai',
  GITHUB: 'github',
  TOMORROW: 'tomorrow',
  TWILIGHT: 'twilight',
  SOLARIZED_DARK: 'solarized_dark',
  SOLARIZED_LIGHT: 'solarized_light',
  TERMINAL: 'terminal',
} as const;

/**
 * Error severity levels
 */
export const ERROR_SEVERITY = {
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info',
} as const;

/**
 * Validation error types
 */
export const VALIDATION_ERROR_TYPES = {
  SYNTAX: 'syntax',
  SEMANTIC: 'semantic',
  CUSTOM: 'custom',
} as const;

/**
 * Completion item types
 */
export const COMPLETION_TYPES = {
  TABLE: 'table',
  COLUMN: 'column',
  KEYWORD: 'keyword',
  FUNCTION: 'function',
  SNIPPET: 'snippet',
  CUSTOM: 'custom',
} as const;

/**
 * Variable pattern for embedded variables
 */
export const VARIABLE_PATTERN = /\$\(([^)]+)\)/g;

/**
 * Variable placeholder prefix
 */
export const VARIABLE_PLACEHOLDER_PREFIX = '${placeholder}';

/**
 * Fuzzy search options
 */
export const FUZZY_SEARCH_OPTIONS = {
  includeScore: true,
  threshold: 0.4,
  keys: ['label', 'detail'],
  minMatchCharLength: 1,
} as const;

