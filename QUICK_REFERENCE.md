# SQL Editor - Quick Reference

## 🚀 Installation

```bash
npm install @sql-editor/react
# or
pnpm add @sql-editor/react
```

## 📝 Basic Usage

```tsx
import { SQLEditor } from '@sql-editor/react';

<SQLEditor
  value={sql}
  onChange={setSql}
  schema={schema}
  height="400px"
/>
```

## 🎨 Props Reference

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | `string` | **required** | SQL content |
| `onChange` | `(value: string) => void` | **required** | Change handler |
| `schema` | `SchemaDefinition` | `undefined` | Database schema |
| `dialect` | `'mysql' \| 'postgresql' \| ...` | `'mysql'` | SQL dialect |
| `height` | `string` | `'400px'` | Editor height |
| `width` | `string` | `'100%'` | Editor width |
| `theme` | `string` | `'monokai'` | Ace theme |
| `fontSize` | `number` | `14` | Font size |
| `tabSize` | `number` | `2` | Tab size |
| `showLineNumbers` | `boolean` | `true` | Show line numbers |
| `readOnly` | `boolean` | `false` | Read-only mode |
| `autocomplete` | `AutocompleteOptions` | `{...}` | Autocomplete config |
| `validation` | `ValidationOptions` | `{...}` | Validation config |

## 🗄️ Schema Definition

```typescript
const schema: SchemaDefinition = {
  databases: {
    mydb: {
      name: 'mydb',
      tables: {
        users: {
          name: 'users',
          columns: {
            id: { type: 'int', primaryKey: true },
            name: { type: 'varchar', length: 255 },
            email: { type: 'varchar', length: 255 },
          },
        },
      },
    },
  },
};
```

## ⚙️ Autocomplete Options

```typescript
autocomplete={{
  enabled: true,              // Enable autocomplete
  fuzzyMatch: true,           // Enable fuzzy matching
  maxSuggestions: 50,         // Max suggestions to show
  triggerCharacters: ['.', ' '], // Trigger characters
  minCharacters: 0,           // Min chars before showing
  caseSensitive: false,       // Case-sensitive matching
  debounceMs: 150,           // Debounce delay
}}
```

## ✅ Validation Options

```typescript
validation={{
  enabled: true,              // Enable validation
  validateOnChange: true,     // Validate on change
  validateSchema: true,       // Validate schema refs
  debounceMs: 300,           // Debounce delay
}}
```

## 🔌 Custom Completion Provider

```typescript
import { CompletionProvider } from '@sql-editor/core';

class MyProvider implements CompletionProvider {
  canProvide(context) {
    return context.type === 'select_list';
  }

  provide(context, schema) {
    return [{
      label: 'MY_FIELD',
      type: 'custom',
      detail: 'Custom field',
      documentation: 'Description',
    }];
  }
}

<SQLEditor
  completionProviders={[new MyProvider()]}
  {...otherProps}
/>
```

## 🪝 Using Hooks

```typescript
import { useSQLEditor } from '@sql-editor/react';

const { value, onChange, errors, validate, schema, autocomplete } = useSQLEditor({
  initialValue: 'SELECT * FROM users',
  schema: mySchema,
  autocompleteOptions: { fuzzyMatch: true },
});
```

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl/Cmd + Space` | Trigger autocomplete |
| `Arrow Up/Down` | Navigate suggestions |
| `Tab` or `Enter` | Accept suggestion |
| `Escape` | Close popup |

## 📊 Column Types

```typescript
type ColumnType =
  | 'int' | 'bigint' | 'smallint' | 'tinyint'
  | 'decimal' | 'numeric' | 'float' | 'double'
  | 'varchar' | 'char' | 'text'
  | 'date' | 'datetime' | 'timestamp' | 'time'
  | 'boolean' | 'bool'
  | 'json' | 'jsonb'
  | 'blob' | 'binary'
  | 'uuid' | 'enum'
  | string; // Custom types allowed
```

## 🎯 Context Types

SQL contexts detected:
- `select_list` - In SELECT column list
- `from_clause` - In FROM clause
- `where_clause` - In WHERE clause
- `join_clause` - In JOIN clause
- `group_by` - In GROUP BY clause
- `order_by` - In ORDER BY clause
- `having_clause` - In HAVING clause
- `function` - Inside function call
- `unknown` - Unknown context

## 💡 Tips & Tricks

### Alias Support
```sql
-- The editor understands aliases
SELECT u.username, u.email
FROM users u
WHERE u.created_at > NOW()
```

### CTE Support
```sql
-- CTEs are recognized
WITH recent_orders AS (
  SELECT * FROM orders WHERE created_at > DATE_SUB(NOW(), INTERVAL 7 DAY)
)
SELECT * FROM recent_orders
```

### Fuzzy Matching
```
Type: "usr" → Suggests "users"
Type: "orit" → Suggests "order_items"
```

### Context-Aware
```sql
-- After FROM: suggests tables
SELECT * FROM |

-- After dot: suggests columns
SELECT u.| FROM users u

-- In WHERE: suggests columns and keywords
WHERE |
```

## 🛠️ Development Commands

```bash
# Install
pnpm install

# Build
pnpm build

# Test
pnpm test

# Lint
pnpm lint

# Run example
pnpm --filter basic dev
```

## 📚 Documentation Links

- [README](./README.md) - Main documentation
- [Architecture](./ARCHITECTURE.md) - Technical design
- [Getting Started](./GETTING_STARTED.md) - Detailed guide
- [Contributing](./CONTRIBUTING.md) - How to contribute

## 🆘 Troubleshooting

**Autocomplete not working?**
- Check `autocomplete.enabled` is `true`
- Ensure schema is provided
- Verify `minCharacters` setting

**Validation errors?**
- Check SQL syntax
- Verify schema matches your database
- Review error messages in editor

**Build issues?**
- Run `pnpm install` first
- Ensure Node.js >= 18
- Try clearing node_modules

## 📦 Packages

- `@sql-editor/core` - Core functionality
- `@sql-editor/react` - React components

## 🔗 Resources

- GitHub: [sql-editor](https://github.com/yourusername/sql-editor)
- Issues: [Report a bug](https://github.com/yourusername/sql-editor/issues)
- Discussions: [Ask questions](https://github.com/yourusername/sql-editor/discussions)

