# SQL Editor

A scalable, extensible SQL editor library built with React, Ace Editor, and dt-sql-parser. Provides intelligent autocomplete with support for table aliases, CTEs, subqueries, and more.

## Features

✨ **Intelligent Autocomplete**
- Context-aware suggestions (tables, columns, keywords, functions)
- Full alias support (`SELECT u.name FROM users u`)
- CTE (Common Table Expression) recognition
- Subquery column inference
- Fuzzy matching with advanced scoring

🎯 **Advanced SQL Parsing**
- **Multi-dialect support** (MySQL, PostgreSQL, Flink, Spark, Hive, Trino, Impala)
- AST-based analysis using dt-sql-parser
- **Variable support** with `$(variable)` syntax
- Real-time validation with helpful error messages
- Syntax highlighting

🔧 **Extensible Architecture**
- Plugin system for custom completions and validators
- Framework-agnostic core package
- Type-safe APIs with full TypeScript support
- Comprehensive TSDoc documentation
- Source maps included for easy debugging
- Centralized constants for SQL keywords, functions, and data types

🧪 **Test-Driven Development**
- **164 passing tests** covering all SQL query types
- Unit, integration, and component tests
- Well-documented test patterns
- Tests for simple queries, joins, CTEs, subqueries, window functions, and more

## Packages

This is a monorepo containing:

- **[@sql-editor/core](./packages/core)**: Framework-agnostic business logic
- **[@sql-editor/react](./packages/react)**: React components and hooks

## Quick Start

### Installation

```bash
npm install @sql-editor/react
# or
yarn add @sql-editor/react
# or
pnpm add @sql-editor/react
```

### Basic Usage

```tsx
import { SQLEditor } from '@sql-editor/react';
import type { SchemaDefinition } from '@sql-editor/core';

const schema: SchemaDefinition = {
  databases: {
    mydb: {
      tables: {
        users: {
          columns: {
            id: { type: 'int', primaryKey: true },
            name: { type: 'varchar', length: 255 },
            email: { type: 'varchar', length: 255 }
          }
        },
        orders: {
          columns: {
            id: { type: 'int', primaryKey: true },
            user_id: { type: 'int', foreignKey: 'users.id' },
            total: { type: 'decimal', precision: 10, scale: 2 }
          }
        }
      }
    }
  }
};

function App() {
  const [sql, setSql] = useState('SELECT * FROM users');

  return (
    <SQLEditor
      value={sql}
      onChange={setSql}
      schema={schema}
      dialect="mysql"
      height="400px"
    />
  );
}
```

### Advanced Usage

```tsx
import { SQLEditor, useAutocomplete } from '@sql-editor/react';
import type { CompletionProvider, SQLContext } from '@sql-editor/core';

// Custom completion provider
class MyFunctionProvider implements CompletionProvider {
  canProvide(context: SQLContext): boolean {
    return context.type === 'function';
  }

  provide(context: SQLContext): Completion[] {
    return [
      {
        label: 'MY_CUSTOM_FUNC',
        type: 'function',
        detail: 'My custom function',
        documentation: 'Does something amazing'
      }
    ];
  }
}

function App() {
  return (
    <SQLEditor
      value={sql}
      onChange={setSql}
      schema={schema}
      completionProviders={[new MyFunctionProvider()]}
      autocomplete={{
        enabled: true,
        fuzzyMatch: true,
        maxSuggestions: 50
      }}
      validation={{
        enabled: true,
        debounceMs: 300
      }}
    />
  );
}
```

## 📚 Documentation

- **[Getting Started](./docs/GETTING_STARTED.md)** - Installation and basic usage
- **[Architecture](./docs/ARCHITECTURE.md)** - Technical design and structure
- **[Parser Guide](./docs/PARSER_GUIDE.md)** - Parser service usage
- **[Quick Reference](./docs/QUICK_REFERENCE.md)** - Common tasks and examples
- **[Contributing](./CONTRIBUTING.md)** - How to contribute

## Development

### Prerequisites

- Node.js >= 18
- PNPM >= 8

### Setup

```bash
# Install dependencies
pnpm install

# Build all packages
pnpm build

# Run tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Type check
pnpm type-check

# Lint
pnpm lint

# Format code
pnpm format
```

### Running Examples

```bash
# Basic example
pnpm --filter basic dev

# Advanced example
pnpm --filter advanced dev
```

### Debugging

Both packages are built with **source maps** for easy debugging:

- 🔍 Debug TypeScript source directly in browser DevTools
- 📍 Original line numbers in stack traces
- ⚙️ Configured in `tsup.config.ts` (both core and react packages)

To debug autocomplete or other features:
1. Open browser DevTools (F12)
2. Go to Sources tab
3. Navigate to `@sql-editor/core` or `@sql-editor/react`
4. Set breakpoints in the TypeScript source!

### Project Structure

```
sql-editor/
├── packages/
│   ├── core/          # @sql-editor/core
│   └── react/         # @sql-editor/react
├── examples/
│   ├── basic/         # Basic usage example
│   └── advanced/      # Advanced features
├── docs/              # Documentation
└── scripts/           # Build scripts
```

## Testing

We follow test-driven development practices:

```bash
# Run all tests
pnpm test

# Run tests with coverage
pnpm test:coverage

# Run specific package tests
pnpm --filter @sql-editor/core test
```

Coverage goals:
- Branches: 80%+
- Functions: 80%+
- Lines: 80%+
- Statements: 80%+

## Contributing

Contributions are welcome! Please read our [Contributing Guide](./CONTRIBUTING.md) for details on our code of conduct and development process.

## License

MIT © [Your Name]

## Roadmap

- [x] Core parser service with dt-sql-parser
- [x] Schema registry and indexing
- [x] Autocomplete engine with alias support
- [x] React component with Ace Editor
- [ ] Multi-dialect support (PostgreSQL, SQL Server, Oracle)
- [ ] Query execution integration
- [ ] Visual query builder
- [ ] Collaborative editing
- [ ] VS Code extension

## Credits

Built with:
- [React](https://react.dev/)
- [Ace Editor](https://ace.c9.io/)
- [dt-sql-parser](https://github.com/DTStack/dt-sql-parser)
- [TypeScript](https://www.typescriptlang.org/)

