# Parser Module Guide

Complete guide to understanding and using the SQL Editor parser module.

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Components](#components)
4. [Usage Examples](#usage-examples)
5. [Testing](#testing)
6. [API Reference](#api-reference)

---

## Overview

The parser module provides SQL parsing, context detection, and variable handling capabilities. It wraps the `dt-sql-parser` library with enhanced functionality specific to the SQL Editor.

### Key Features

- ✅ SQL syntax parsing and validation
- ✅ Table reference extraction
- ✅ Alias mapping
- ✅ Context detection (SELECT, FROM, WHERE, etc.)
- ✅ Embedded variable support `$(variable)`
- ✅ Error position tracking

---

## Architecture

```
parser/
├── parser-service.ts      # Main parser wrapper
├── context-detector.ts    # SQL context detection
├── variable-handler.ts    # Variable handling
└── __tests__/             # Comprehensive unit tests
    ├── parser-service.test.ts
    ├── context-detector.test.ts
    └── variable-handler.test.ts
```

### Data Flow

```
SQL Input
    ↓
[VariableHandler] → Escape variables if enabled
    ↓
[ParserService] → Parse SQL using dt-sql-parser
    ↓
├─→ Extract table references
├─→ Extract aliases
└─→ Map errors
    ↓
[VariableHandler] → Revert error positions
    ↓
ParseResult (AST, errors, tableRefs, aliases)
```

---

## Components

### 1. ParserService

Main parsing engine that wraps `dt-sql-parser` with enhanced functionality.

#### Core Responsibilities

- Parse SQL and generate AST
- Validate SQL syntax
- Extract table references and aliases
- Handle embedded variables
- Provide error messages with locations

#### Key Methods

```typescript
// Parse SQL
const result = parser.parse('SELECT * FROM users');
// Returns: { success, ast, errors, tableRefs, aliases }

// Validate SQL
const isValid = parser.validate('SELECT * FROM users');
// Returns: boolean

// Extract table references from AST
const tableRefs = parser.extractTableRefs(ast);
// Returns: TableReference[]

// Extract alias mappings
const aliases = parser.extractAliases(tableRefs);
// Returns: AliasMap

// Enable variable support
parser.setOptions({ embeddedVariables: true });
```

#### How It Works

1. **Variable Escaping** (if enabled)
   - Replaces `$(variable)` with placeholders
   - Tracks variable positions

2. **Parsing**
   - Uses `dt-sql-parser` to parse SQL
   - Generates Abstract Syntax Tree (AST)
   - Validates syntax

3. **Extraction**
   - Traverses AST to find table references
   - Identifies CTEs (Common Table Expressions)
   - Maps aliases to tables

4. **Error Mapping**
   - Converts parser errors to standard format
   - Adjusts positions for escaped variables
   - Provides line/column information

---

### 2. ContextDetector

Determines the SQL context at a specific cursor position.

#### Core Responsibilities

- Detect which SQL clause the cursor is in
- Identify table/column prefixes (before dot)
- Track current and previous tokens
- Resolve table aliases

#### Key Functions

```typescript
// Detect context at cursor position
const context = detectContext(
  'SELECT u. FROM users u',
  { line: 0, column: 9 },  // After 'u.'
  tableRefs
);
// Returns: {
//   type: 'select_list',
//   position: { line: 0, column: 9 },
//   availableTables: [...],
//   currentToken: '',
//   afterDot: true,
//   dotPrefix: 'u'
// }

// Resolve alias to table
const table = resolveAlias('u', tableRefs);
// Returns: TableReference | undefined
```

#### Context Types

| Type | Description | Example |
|------|-------------|---------|
| `select_list` | In SELECT column list | `SELECT █` |
| `from_clause` | In FROM clause | `SELECT * FROM █` |
| `where_clause` | In WHERE clause | `WHERE █` |
| `join_clause` | In JOIN clause | `JOIN █` |
| `group_by` | In GROUP BY clause | `GROUP BY █` |
| `order_by` | In ORDER BY clause | `ORDER BY █` |
| `having_clause` | In HAVING clause | `HAVING █` |
| `function` | Inside function call | `COUNT(█)` |
| `unknown` | Unknown context | - |

#### How It Works

1. **Token Analysis**
   - Extracts current token (word being typed)
   - Identifies previous token
   - Detects dot notation (table.column)

2. **Context Detection**
   - Scans SQL backwards from cursor
   - Identifies SQL keywords (SELECT, FROM, WHERE)
   - Checks parenthesis depth for functions
   - Determines most specific context

3. **Precedence Order**
   ```
   HAVING > ORDER BY > GROUP BY > WHERE > JOIN > FROM > SELECT
   ```
   More specific clauses take precedence over general ones.

---

### 3. VariableHandler

Handles embedded variables like `$(variable)` in SQL queries.

#### Core Responsibilities

- Detect variables in SQL
- Extract variable names
- Escape variables for parsing
- Revert escaped SQL
- Adjust error positions

#### Key Methods

```typescript
const handler = new VariableHandler();

// Check if SQL has variables
const hasVars = handler.hasVariables('SELECT * FROM $(table)');
// Returns: true

// Extract variable names
const vars = handler.extractVariables('SELECT $(col) FROM $(table)');
// Returns: ['col', 'table']

// Escape variables for parsing
const escaped = handler.escapeVariables('SELECT * FROM $(table)');
// Returns: {
//   escapedSql: 'SELECT * FROM ${placeholder}_0',
//   variableMap: { '${placeholder}_0': '$(table)' }
// }

// Revert escaped SQL
const original = handler.revertEscapedSql(
  escaped.escapedSql,
  escaped.variableMap
);
// Returns: 'SELECT * FROM $(table)'

// Adjust error positions
const adjustedErrors = handler.revertErrorPositions(
  errors,
  originalSql,
  escapedSql,
  variableMap
);
```

#### Variable Format

```typescript
// Supported format: $(variableName)
$(table)           // ✅ Valid
$(column_name)     // ✅ Valid
$(var123)          // ✅ Valid
$(table-name)      // ❌ Invalid (hyphens not supported in regex)
$variable          // ❌ Invalid (must use parentheses)
```

#### How It Works

1. **Detection**
   - Uses regex: `/\$\(([^)]+)\)/g`
   - Matches `$(...)` patterns
   - Extracts variable names

2. **Escaping**
   - Replaces each `$(var)` with unique placeholder
   - Creates map: `{ placeholder → originalVariable }`
   - Preserves SQL structure

3. **Position Tracking**
   - Tracks length differences
   - Adjusts error column positions
   - Maintains line numbers

4. **Error Adjustment**
   - Calculates offset from variable replacements
   - Updates error start/end positions
   - Preserves error message and severity

---

## Usage Examples

### Basic SQL Parsing

```typescript
import { ParserService } from '@sql-editor/core';

const parser = new ParserService();
const result = parser.parse('SELECT * FROM users WHERE id = 1');

if (result.success) {
  console.log('Tables:', result.tableRefs);
  console.log('Aliases:', result.aliases);
} else {
  console.error('Errors:', result.errors);
}
```

### Context-Aware Autocomplete

```typescript
import { ParserService, detectContext } from '@sql-editor/core';

const parser = new ParserService();
const sql = 'SELECT u. FROM users u';
const cursorPos = { line: 0, column: 9 }; // After 'u.'

// Parse to get table references
const parseResult = parser.parse(sql);

// Detect context
const context = detectContext(sql, cursorPos, parseResult.tableRefs);

if (context.afterDot && context.dotPrefix) {
  // User typed "u." - suggest columns from 'users' table
  const table = resolveAlias(context.dotPrefix, parseResult.tableRefs);
  console.log(`Suggest columns from table: ${table?.name}`);
}
```

### Variable Support

```typescript
import { ParserService } from '@sql-editor/core';

const parser = new ParserService();
parser.setOptions({ embeddedVariables: true });

const sql = 'SELECT * FROM $(tableName) WHERE id = $(userId)';
const result = parser.parse(sql);

// Variables are automatically escaped during parsing
console.log('Parse success:', result.success);
console.log('Tables found:', result.tableRefs);
```

### Advanced: Custom Variable Extraction

```typescript
import { VariableHandler } from '@sql-editor/core';

const handler = new VariableHandler();
const sql = 'SELECT $(col1), $(col2) FROM $(table)';

// Extract all variables
const variables = handler.extractVariables(sql);
console.log('Variables:', variables); // ['col1', 'col2', 'table']

// You can now prompt user for values
const values = {
  col1: 'id',
  col2: 'name',
  table: 'users'
};

// Replace variables manually if needed
let finalSql = sql;
variables.forEach(variable => {
  finalSql = finalSql.replace(`$(${variable})`, values[variable]);
});
console.log('Final SQL:', finalSql);
// Output: 'SELECT id, name FROM users'
```

### Error Handling with Variables

```typescript
import { ParserService } from '@sql-editor/core';

const parser = new ParserService();
parser.setOptions({ embeddedVariables: true });

// SQL with syntax error and variables
const sql = 'SELECT * FROM $(table) WHERE'; // Missing condition

const result = parser.parse(sql);

// Error positions are automatically adjusted for variables
result.errors.forEach(error => {
  console.log(`Error at line ${error.location?.start.line}:`);
  console.log(`  ${error.message}`);
});
```

---

## Testing

The parser module has **comprehensive unit tests** covering all functionality.

### Test Structure

```
__tests__/
├── parser-service.test.ts     (45 tests)
├── context-detector.test.ts   (43 tests)
└── variable-handler.test.ts   (13 tests)
```

### Running Tests

```bash
# Run all parser tests
npm test -- parser

# Run specific test file
npm test -- parser-service.test.ts

# Run with coverage
npm test -- --coverage parser
```

### Test Coverage

| Component | Tests | Coverage |
|-----------|-------|----------|
| ParserService | 45 | ✅ All methods |
| ContextDetector | 43 | ✅ All contexts |
| VariableHandler | 13 | ✅ All methods |
| **Total** | **101** | **Comprehensive** |

### What's Tested

#### ParserService Tests
- ✅ Valid SQL parsing
- ✅ Error detection and location
- ✅ Table reference extraction
- ✅ Alias mapping
- ✅ JOIN statements
- ✅ Complex queries (GROUP BY, HAVING, etc.)
- ✅ Variable support
- ✅ Edge cases (empty SQL, comments, multi-line)

#### ContextDetector Tests
- ✅ All 9 context types
- ✅ Dot notation detection
- ✅ Token extraction
- ✅ Alias resolution
- ✅ Multi-line SQL
- ✅ Case insensitivity
- ✅ Edge cases (start/end of SQL, special characters)

#### VariableHandler Tests
- ✅ Variable detection
- ✅ Variable extraction
- ✅ Escaping/reverting
- ✅ Error position adjustment
- ✅ Round-trip accuracy
- ✅ Edge cases (nested, consecutive, special chars)

---

## API Reference

### Types

```typescript
// SQL Context
interface SQLContext {
  type: SQLContextType;
  position: Position;
  availableTables: TableReference[];
  currentToken: string;
  previousToken?: string;
  afterDot: boolean;
  dotPrefix?: string;
}

type SQLContextType =
  | 'select_list'
  | 'from_clause'
  | 'where_clause'
  | 'join_clause'
  | 'group_by'
  | 'order_by'
  | 'having_clause'
  | 'function'
  | 'unknown';

// Parse Result
interface ParseResult {
  success: boolean;
  ast?: any;
  errors: ParseError[];
  tableRefs: TableReference[];
  aliases: AliasMap;
}

// Table Reference
interface TableReference {
  name: string;
  database?: string;
  alias?: string;
  isCTE?: boolean;
  cteColumns?: string[];
}

// Variable Types
interface VariableMap {
  [placeholder: string]: string;
}

interface EscapedResult {
  escapedSql: string;
  variableMap: VariableMap;
}
```

### ParserService

```typescript
class ParserService {
  constructor();
  
  // Parse SQL
  parse(sql: string): ParseResult;
  
  // Validate SQL
  validate(sql: string): boolean;
  
  // Extract references
  extractTableRefs(ast: any): TableReference[];
  extractAliases(tableRefs: TableReference[]): AliasMap;
  
  // Suggestions
  getSuggestions(sql: string): string[];
  getSuggestionsAtCaretPosition(
    sql: string,
    caret: { lineNumber: number; column: number }
  ): { keywords?: string[]; tables?: string[]; columns?: string[] };
  
  // Options
  setOptions(options: { embeddedVariables?: boolean }): void;
}
```

### ContextDetector

```typescript
// Detect context at position
function detectContext(
  sql: string,
  position: Position,
  tableRefs: TableReference[]
): SQLContext;

// Resolve table alias
function resolveAlias(
  alias: string,
  tableRefs: TableReference[]
): TableReference | undefined;
```

### VariableHandler

```typescript
class VariableHandler {
  constructor();
  
  // Check for variables
  hasVariables(sql: string): boolean;
  
  // Extract variable names
  extractVariables(sql: string): string[];
  
  // Escape/revert
  escapeVariables(sql: string): EscapedResult;
  revertEscapedSql(escapedSql: string, variableMap: VariableMap): string;
  
  // Error position adjustment
  revertErrorPositions(
    errors: Array<any>,
    originalSql: string,
    escapedSql: string,
    variableMap: VariableMap
  ): Array<any>;
}
```

---

## Best Practices

### 1. Always Check Parse Success

```typescript
const result = parser.parse(sql);
if (!result.success) {
  // Handle errors
  result.errors.forEach(error => {
    console.error(error.message);
  });
}
```

### 2. Use Context Detection for Autocomplete

```typescript
const context = detectContext(sql, cursorPos, tableRefs);

switch (context.type) {
  case 'select_list':
    // Suggest columns
    break;
  case 'from_clause':
    // Suggest tables
    break;
  case 'where_clause':
    // Suggest columns and operators
    break;
}
```

### 3. Enable Variables Only When Needed

```typescript
// Only enable if your use case requires it
if (sqlContainsVariables) {
  parser.setOptions({ embeddedVariables: true });
}
```

### 4. Handle Errors Gracefully

```typescript
try {
  const result = parser.parse(sql);
  // Process result
} catch (error) {
  // Parser wraps errors, but be safe
  console.error('Unexpected error:', error);
}
```

---

## Troubleshooting

### Common Issues

**Q: Parse fails for valid SQL**
```typescript
// Check if variables are enabled when they shouldn't be
parser.setOptions({ embeddedVariables: false });
```

**Q: Table references not extracted**
```typescript
// Ensure parse succeeded first
if (result.success) {
  console.log(result.tableRefs);
} else {
  console.log('Fix syntax errors first');
}
```

**Q: Context detection incorrect**
```typescript
// Make sure to pass correct cursor position (0-based)
const context = detectContext(sql, { line: 0, column: 10 }, tableRefs);
```

**Q: Variables not recognized**
```typescript
// Check variable format
'$(tableName)'  // ✅ Correct
'$tableName'    // ❌ Missing parentheses
'${tableName}'  // ❌ Wrong syntax
```

---

## Performance Considerations

- **Parsing**: O(n) where n is SQL length
- **Table Extraction**: O(m) where m is AST node count
- **Context Detection**: O(n) where n is SQL length before cursor
- **Variable Escaping**: O(v) where v is number of variables

All operations are optimized for typical SQL query sizes (< 10KB).

---

## Future Enhancements

Potential improvements for the parser module:

- [ ] Incremental parsing for large files
- [ ] More detailed AST typing
- [ ] Support for more SQL dialects
- [ ] Advanced error recovery
- [ ] Syntax highlighting tokens
- [ ] Query formatting/beautification

---

## Resources

- [dt-sql-parser Documentation](https://github.com/DTStack/dt-sql-parser)
- [SQL Grammar Reference](https://dev.mysql.com/doc/refman/8.0/en/sql-syntax.html)
- [Testing Best Practices](../../CONTRIBUTING.md)

---

**Last Updated**: October 2025
**Maintainer**: SQL Editor Core Team

