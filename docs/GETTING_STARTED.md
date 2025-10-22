# Getting Started with SQL Editor

This guide will help you get started with the SQL Editor library quickly.

## Installation

### Using npm
```bash
npm install @sql-editor/react
```

### Using yarn
```bash
yarn add @sql-editor/react
```

### Using pnpm
```bash
pnpm add @sql-editor/react
```

## Quick Start

### 1. Basic Usage

```tsx
import React, { useState } from 'react';
import { SQLEditor } from '@sql-editor/react';
import type { SchemaDefinition } from '@sql-editor/core';

// Define your database schema
const schema: SchemaDefinition = {
  databases: {
    myapp: {
      name: 'myapp',
      tables: {
        users: {
          name: 'users',
          columns: {
            id: { type: 'int', primaryKey: true },
            username: { type: 'varchar', length: 50 },
            email: { type: 'varchar', length: 255 },
            created_at: { type: 'timestamp' },
          },
        },
        posts: {
          name: 'posts',
          columns: {
            id: { type: 'int', primaryKey: true },
            user_id: { type: 'int', foreignKey: 'users.id' },
            title: { type: 'varchar', length: 200 },
            content: { type: 'text' },
            created_at: { type: 'timestamp' },
          },
        },
      },
    },
  },
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

export default App;
```

### 2. With Custom Options

```tsx
<SQLEditor
  value={sql}
  onChange={setSql}
  schema={schema}
  dialect="mysql"
  height="500px"
  theme="monokai"
  fontSize={14}
  tabSize={2}
  showLineNumbers={true}
  autocomplete={{
    enabled: true,
    fuzzyMatch: true,
    maxSuggestions: 50,
    triggerCharacters: ['.', ' '],
  }}
  validation={{
    enabled: true,
    validateOnChange: true,
    debounceMs: 300,
  }}
/>
```

### 3. Using Custom Completion Providers

```tsx
import { CompletionProvider } from '@sql-editor/core';

// Create a custom provider
class MyCustomProvider implements CompletionProvider {
  canProvide(context) {
    return context.type === 'select_list';
  }

  provide(context, schema) {
    return [
      {
        label: 'CUSTOM_FIELD',
        type: 'custom',
        detail: 'My custom field',
        documentation: 'A custom completion item',
      },
    ];
  }
}

// Use it in the editor
<SQLEditor
  value={sql}
  onChange={setSql}
  schema={schema}
  completionProviders={[new MyCustomProvider()]}
/>
```

### 4. Using Hooks for Advanced Control

```tsx
import { useSQLEditor, useAutocomplete } from '@sql-editor/react';

function CustomEditor() {
  const {
    value,
    onChange,
    errors,
    validate,
    schema,
    autocomplete,
  } = useSQLEditor({
    initialValue: 'SELECT * FROM users',
    schema: mySchema,
    autocompleteOptions: {
      enabled: true,
      fuzzyMatch: true,
    },
  });

  const {
    suggestions,
    getSuggestions,
    visible,
    show,
    hide,
  } = useAutocomplete({
    engine: autocomplete,
    schema,
  });

  // Use these in your custom implementation
  return (
    <div>
      {/* Your custom UI */}
    </div>
  );
}
```

## Features Overview

### Autocomplete

The editor provides intelligent autocomplete with:

- **Table suggestions** in FROM and JOIN clauses
- **Column suggestions** with awareness of table aliases
- **Keyword suggestions** based on context
- **Function suggestions** for SQL functions
- **Fuzzy matching** to find items as you type

Example:
```sql
-- Type "SELECT u." to see columns from users table
SELECT u.username, u.email
FROM users u
WHERE u.created_at > NOW()
```

### Validation

Real-time validation checks:

- **Syntax errors** from the SQL parser
- **Schema validation** (undefined tables/columns)
- **Custom validators** via plugins

### Keyboard Shortcuts

- `Ctrl/Cmd + Space` - Trigger autocomplete
- `Tab` or `Enter` - Accept selected suggestion
- `Arrow Up/Down` - Navigate suggestions
- `Escape` - Close autocomplete popup

## Common Use Cases

### 1. Query Builder Interface

```tsx
function QueryBuilder() {
  const [sql, setSql] = useState('');
  const [results, setResults] = useState([]);

  const executeQuery = async () => {
    const response = await fetch('/api/query', {
      method: 'POST',
      body: JSON.stringify({ sql }),
    });
    const data = await response.json();
    setResults(data);
  };

  return (
    <div>
      <SQLEditor value={sql} onChange={setSql} schema={schema} />
      <button onClick={executeQuery}>Execute</button>
      <ResultsTable data={results} />
    </div>
  );
}
```

### 2. SQL Learning Platform

```tsx
function SQLTutorial() {
  const [currentLesson, setCurrentLesson] = useState(0);
  const [userSQL, setUserSQL] = useState('');

  const lessons = [
    {
      title: 'SELECT Statement',
      task: 'Write a query to select all users',
      solution: 'SELECT * FROM users',
    },
    // More lessons...
  ];

  const checkAnswer = () => {
    const isCorrect = userSQL.trim() === lessons[currentLesson].solution;
    // Show feedback
  };

  return (
    <div>
      <h2>{lessons[currentLesson].title}</h2>
      <p>{lessons[currentLesson].task}</p>
      <SQLEditor value={userSQL} onChange={setUserSQL} schema={schema} />
      <button onClick={checkAnswer}>Check Answer</button>
    </div>
  );
}
```

### 3. Database Admin Tool

```tsx
function AdminPanel() {
  const [sql, setSql] = useState('');
  const [history, setHistory] = useState<string[]>([]);

  const execute = () => {
    // Execute SQL
    setHistory([...history, sql]);
  };

  return (
    <div>
      <SQLEditor value={sql} onChange={setSql} schema={schema} />
      <button onClick={execute}>Execute</button>
      
      <div>
        <h3>Query History</h3>
        {history.map((query, i) => (
          <div key={i} onClick={() => setSql(query)}>
            {query}
          </div>
        ))}
      </div>
    </div>
  );
}
```

## TypeScript Support

The library is written in TypeScript and provides full type definitions:

```tsx
import type {
  SchemaDefinition,
  TableDefinition,
  ColumnDefinition,
  Completion,
  CompletionProvider,
  ValidationError,
} from '@sql-editor/core';
```

## Next Steps

- Check out the [examples](./examples/) for more complex use cases
- Read the [Architecture](./ARCHITECTURE.md) to understand the internals
- See [CONTRIBUTING.md](./CONTRIBUTING.md) to contribute
- Browse the [API documentation](./docs/api/) for detailed reference

## Support

- 📚 [Documentation](./README.md)
- 🐛 [Issue Tracker](https://github.com/yourusername/sql-editor/issues)
- 💬 [Discussions](https://github.com/yourusername/sql-editor/discussions)

## License

MIT © SQL Editor Contributors

