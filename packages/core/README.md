# @sql-editor/core

Framework-agnostic SQL editor core library with intelligent autocomplete, validation, and parsing capabilities.

## Features

- 🎯 **SQL Parsing**: Advanced SQL parsing using dt-sql-parser
- 🔍 **Schema Management**: Efficient schema registry with indexing
- ✨ **Autocomplete**: Context-aware suggestions with alias support
- ✅ **Validation**: Syntax and semantic validation
- 🔧 **Extensible**: Plugin architecture for custom providers

## Installation

```bash
npm install @sql-editor/core
```

## Usage

### Parser Service

```typescript
import { ParserService, MySQLDialect } from '@sql-editor/core';

const parser = new ParserService(new MySQLDialect());
const result = parser.parse('SELECT * FROM users');

if (result.success) {
  console.log('AST:', result.ast);
} else {
  console.error('Errors:', result.errors);
}
```

### Schema Registry

```typescript
import { SchemaRegistry } from '@sql-editor/core';

const registry = new SchemaRegistry();

registry.registerSchema({
  databases: {
    mydb: {
      tables: {
        users: {
          columns: {
            id: { type: 'int', primaryKey: true },
            name: { type: 'varchar', length: 255 }
          }
        }
      }
    }
  }
});

const table = registry.getTable('users');
const columns = registry.getColumns('users');
```

### Autocomplete Engine

```typescript
import { AutocompleteEngine, SchemaRegistry } from '@sql-editor/core';

const engine = new AutocompleteEngine();
const schema = new SchemaRegistry();

const suggestions = engine.getSuggestions(
  'SELECT u. FROM users u',
  { line: 0, column: 9 },
  schema
);

console.log(suggestions); // [{ label: 'id', type: 'column' }, ...]
```

## API Documentation

See the [full API documentation](../../docs/api) for detailed information.

## License

MIT

