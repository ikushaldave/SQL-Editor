# Parser Module

SQL parsing, context detection, and variable handling for the SQL Editor.

## Quick Start

```typescript
import { ParserService, detectContext } from '@sql-editor/core';

// 1. Parse SQL
const parser = new ParserService();
const result = parser.parse('SELECT * FROM users WHERE id = 1');

console.log(result.success);     // true
console.log(result.tableRefs);   // [{ name: 'users' }]
console.log(result.aliases);     // { users: { name: 'users' } }

// 2. Detect Context
const context = detectContext(
  'SELECT u. FROM users u',
  { line: 0, column: 9 },  // After 'u.'
  result.tableRefs
);

console.log(context.type);       // 'select_list'
console.log(context.afterDot);   // true
console.log(context.dotPrefix);  // 'u'

// 3. Handle Variables
parser.setOptions({ embeddedVariables: true });
const varResult = parser.parse('SELECT * FROM $(table)');
console.log(varResult.success);  // true
```

## Components

### 1️⃣ ParserService
Main parsing engine - parses SQL, extracts tables, validates syntax.

**Key Methods:**
- `parse(sql)` - Parse and analyze SQL
- `validate(sql)` - Check syntax validity
- `extractTableRefs(ast)` - Get table references
- `extractAliases(tableRefs)` - Build alias map

### 2️⃣ ContextDetector  
Determines SQL context at cursor position for autocomplete.

**Key Functions:**
- `detectContext(sql, position, tables)` - Identify context type
- `resolveAlias(alias, tables)` - Resolve alias to table

**Context Types:**
`select_list` | `from_clause` | `where_clause` | `join_clause` | `group_by` | `order_by` | `having_clause` | `function` | `unknown`

### 3️⃣ VariableHandler
Handles embedded variables like `$(variable)`.

**Key Methods:**
- `hasVariables(sql)` - Check for variables
- `extractVariables(sql)` - Get variable names
- `escapeVariables(sql)` - Prepare for parsing
- `revertEscapedSql(sql, map)` - Restore original

## Files

```
parser/
├── parser-service.ts      # Main parser (286 lines)
├── context-detector.ts    # Context detection (193 lines)
├── variable-handler.ts    # Variable handling (177 lines)
├── index.ts              # Exports
├── __tests__/            # Unit tests (101 tests)
│   ├── parser-service.test.ts     (45 tests)
│   ├── context-detector.test.ts   (43 tests)
│   └── variable-handler.test.ts   (13 tests)
├── PARSER_GUIDE.md       # Comprehensive guide
└── README.md            # This file
```

## Testing

```bash
# Run all parser tests (101 tests)
npm test -- parser

# Run specific component
npm test -- parser-service
npm test -- context-detector
npm test -- variable-handler

# With coverage
npm test -- --coverage parser
```

**Test Coverage:** ✅ 101/101 tests passing

## Examples

### Parse with Error Handling

```typescript
const result = parser.parse('SELECT * FROM');

if (!result.success) {
  result.errors.forEach(error => {
    console.log(`Error: ${error.message}`);
    if (error.location) {
      console.log(`  Line ${error.location.start.line}`);
      console.log(`  Column ${error.location.start.column}`);
    }
  });
}
```

### Context-Aware Suggestions

```typescript
const sql = 'SELECT * FROM users WHERE ';
const context = detectContext(sql, { line: 0, column: 26 }, []);

if (context.type === 'where_clause') {
  // Suggest: column names, AND, OR, operators
  console.log('Suggest WHERE clause completions');
}
```

### Variable Extraction

```typescript
import { VariableHandler } from '@sql-editor/core';

const handler = new VariableHandler();
const sql = 'SELECT $(col) FROM $(table)';

const variables = handler.extractVariables(sql);
console.log(variables); // ['col', 'table']

// Escape for parsing
const { escapedSql, variableMap } = handler.escapeVariables(sql);
// Parse escapedSql...
// Revert if needed
const original = handler.revertEscapedSql(escapedSql, variableMap);
```

### Join with Aliases

```typescript
const sql = `
  SELECT u.name, o.total
  FROM users u
  JOIN orders o ON u.id = o.user_id
`;

const result = parser.parse(sql);

console.log(result.tableRefs);
// [
//   { name: 'users', alias: 'u' },
//   { name: 'orders', alias: 'o' }
// ]

console.log(result.aliases);
// {
//   u: { name: 'users', alias: 'u' },
//   users: { name: 'users', alias: 'u' },
//   o: { name: 'orders', alias: 'o' },
//   orders: { name: 'orders', alias: 'o' }
// }
```

## How It Works

### Parsing Flow

```
User enters SQL
       ↓
┌──────────────────┐
│ Has variables?   │
│ $(var)          │
└──────┬───────────┘
       ↓ YES
┌──────────────────┐
│ Escape variables │
│ $(var) → placeholder │
└──────┬───────────┘
       ↓
┌──────────────────┐
│ dt-sql-parser    │
│ Parse SQL → AST  │
└──────┬───────────┘
       ↓
┌──────────────────┐
│ Extract data     │
│ • Tables         │
│ • Aliases        │
│ • Errors         │
└──────┬───────────┘
       ↓
┌──────────────────┐
│ Adjust positions │
│ (if variables)   │
└──────┬───────────┘
       ↓
    Result
```

### Context Detection Flow

```
User types SQL
       ↓
┌──────────────────┐
│ Get cursor pos   │
│ line:0, col:15   │
└──────┬───────────┘
       ↓
┌──────────────────┐
│ Analyze tokens   │
│ • Current token  │
│ • Previous token │
│ • After dot?     │
└──────┬───────────┘
       ↓
┌──────────────────┐
│ Scan backwards   │
│ Find SQL clause  │
└──────┬───────────┘
       ↓
┌──────────────────┐
│ Return context   │
│ + suggestions    │
└──────────────────┘
```

## API Quick Reference

### ParserService

| Method | Parameters | Returns | Description |
|--------|------------|---------|-------------|
| `parse` | `sql: string` | `ParseResult` | Parse SQL completely |
| `validate` | `sql: string` | `boolean` | Check if valid |
| `extractTableRefs` | `ast: any` | `TableReference[]` | Get tables from AST |
| `extractAliases` | `tableRefs: TableReference[]` | `AliasMap` | Create alias map |
| `setOptions` | `{ embeddedVariables?: boolean }` | `void` | Configure parser |

### ContextDetector

| Function | Parameters | Returns | Description |
|----------|------------|---------|-------------|
| `detectContext` | `sql, position, tableRefs` | `SQLContext` | Detect context at position |
| `resolveAlias` | `alias, tableRefs` | `TableReference?` | Resolve alias to table |

### VariableHandler

| Method | Parameters | Returns | Description |
|--------|------------|---------|-------------|
| `hasVariables` | `sql: string` | `boolean` | Check for variables |
| `extractVariables` | `sql: string` | `string[]` | Get variable names |
| `escapeVariables` | `sql: string` | `EscapedResult` | Escape for parsing |
| `revertEscapedSql` | `escapedSql, variableMap` | `string` | Restore original |
| `revertErrorPositions` | `errors, ...` | `Error[]` | Adjust error positions |

## Common Patterns

### Pattern 1: Parse → Extract → Use

```typescript
const result = parser.parse(sql);
if (result.success) {
  // Use tableRefs for autocomplete
  // Use aliases for column suggestions
  // Use AST for advanced analysis
}
```

### Pattern 2: Context → Suggest

```typescript
const context = detectContext(sql, cursorPos, tableRefs);
switch (context.type) {
  case 'from_clause':
    return suggestTables();
  case 'select_list':
    return context.afterDot 
      ? suggestColumns(context.dotPrefix)
      : suggestColumnsAndFunctions();
}
```

### Pattern 3: Variable → Parse → Result

```typescript
parser.setOptions({ embeddedVariables: true });
const result = parser.parse(sqlWithVars);
// Variables automatically handled
```

## Performance

All operations are O(n) or better:
- **Parsing**: O(n) - linear in SQL length
- **Context Detection**: O(n) - scans backwards
- **Variable Handling**: O(v) - number of variables

Optimized for SQL queries < 10KB.

## Documentation

- 📖 **[PARSER_GUIDE.md](./PARSER_GUIDE.md)** - Comprehensive guide with examples
- 📝 **[Integration Tests](../__tests__/integration.test.ts)** - Real-world usage
- 🧪 **[Unit Tests](./__tests__/)** - Component-specific tests

## Related

- **[Autocomplete Module](../autocomplete/)** - Uses parser for suggestions
- **[Schema Registry](../schema/)** - Provides table/column data
- **[Validator](../validator/)** - Uses parser for validation

---

💡 **Tip**: Start with the [Quick Start](#quick-start) above, then read [PARSER_GUIDE.md](./PARSER_GUIDE.md) for in-depth understanding.

