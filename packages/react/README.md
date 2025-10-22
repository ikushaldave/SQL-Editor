# @sql-editor/react

React SQL editor component with intelligent autocomplete, validation, and syntax highlighting.

## Features

- ⚛️ **React Components**: Ready-to-use SQL editor component
- 🎨 **Ace Editor Integration**: Powerful code editing experience
- ✨ **Smart Autocomplete**: Context-aware suggestions with popup
- 🎯 **Custom Hooks**: Composable React hooks for editor functionality
- 🎨 **Themeable**: Support for custom themes
- ♿ **Accessible**: ARIA-compliant components

## Installation

```bash
npm install @sql-editor/react
```

## Quick Start

```tsx
import { SQLEditor } from '@sql-editor/react';
import { useState } from 'react';

function App() {
  const [sql, setSql] = useState('SELECT * FROM users');

  return (
    <SQLEditor
      value={sql}
      onChange={setSql}
      schema={{
        databases: {
          mydb: {
            tables: {
              users: {
                columns: {
                  id: { type: 'int' },
                  name: { type: 'varchar' }
                }
              }
            }
          }
        }
      }}
      height="400px"
    />
  );
}
```

## Advanced Usage

### Custom Completion Provider

```tsx
import { SQLEditor } from '@sql-editor/react';
import type { CompletionProvider } from '@sql-editor/core';

const myProvider: CompletionProvider = {
  canProvide: (context) => context.type === 'function',
  provide: () => [
    { label: 'MY_FUNC', type: 'function', detail: 'Custom function' }
  ]
};

<SQLEditor
  value={sql}
  onChange={setSql}
  completionProviders={[myProvider]}
/>
```

### Using Hooks

```tsx
import { useSQLEditor, useAutocomplete } from '@sql-editor/react';

function CustomEditor() {
  const { value, onChange, validate } = useSQLEditor({
    initialValue: 'SELECT * FROM users',
    dialect: 'mysql'
  });

  const { suggestions, getSuggestions } = useAutocomplete({
    schema: mySchema
  });

  // Custom implementation...
}
```

## Components

- **SQLEditor**: Main editor component
- **CompletionPopup**: Autocomplete suggestions popup
- **ErrorMarker**: Error visualization component
- **Toolbar**: Optional toolbar with common actions

## Hooks

- **useSQLEditor**: Main editor logic
- **useAutocomplete**: Autocomplete functionality
- **useValidation**: SQL validation
- **useSchema**: Schema management

## Props

### SQLEditor

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| value | string | - | SQL content |
| onChange | (value: string) => void | - | Change handler |
| schema | SchemaDefinition | - | Database schema |
| dialect | SQLDialect | 'mysql' | SQL dialect |
| height | string | '400px' | Editor height |
| theme | string | 'monokai' | Ace theme |
| autocomplete | AutocompleteOptions | {...} | Autocomplete config |
| validation | ValidationOptions | {...} | Validation config |

## License

MIT

