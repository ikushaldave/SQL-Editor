# Advanced SQL Editor Example

This example demonstrates all the advanced features of the SQL Editor package:

## 🚀 Features Demonstrated

### 1. **Variable Support**
- Embedded variables like `$(variable)` with automatic escaping
- Position mapping for accurate error reporting
- Variable extraction and validation

### 2. **Advanced Validation Rules**
- **Schema Validation**: Checks for undefined tables/columns
- **Performance Validation**: Warns about missing LIMIT clauses, SELECT * without WHERE
- **Naming Convention**: Validates naming conventions
- **Custom Rules**: Extensible rule system

### 3. **Context-Aware Autocomplete**
- Table suggestions in FROM clauses
- Column suggestions with alias support (e.g., `u.` shows user columns)
- Context-specific keywords
- Custom completion providers for business logic

### 4. **Plugin Architecture**
- Custom completion providers
- Custom validation rules
- Type-safe APIs
- Plugin lifecycle management

## 🎯 Try These Examples

1. **Variable Example**: `SELECT $(columns) FROM $(table) WHERE $(condition)`
2. **Alias Completion**: Type `SELECT u.` to see user table columns
3. **Performance Warning**: `SELECT * FROM users` (triggers LIMIT warning)
4. **Custom Providers**: `SELECT CURRENT_USER, IS_ACTIVE FROM users`

## 🛠️ Running the Example

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Build for production
pnpm build
```

## 📁 Project Structure

```
src/
├── App.tsx                 # Main application component
├── data/
│   └── advanced-schema.ts  # Comprehensive database schema
└── styles/
    └── App.css            # Application styles
```

## 🔧 Key Components

### Custom Business Logic Provider
```typescript
class BusinessLogicProvider implements CompletionProvider {
  canProvide(context: SQLContext): boolean {
    return context.type === 'select_list' || context.type === 'where_clause';
  }

  provide(context: SQLContext, schema: SchemaRegistry): Completion[] {
    return [
      {
        label: 'CURRENT_USER',
        type: 'custom',
        detail: 'Current user function',
        documentation: 'Returns the current logged-in user',
      },
      // ... more custom completions
    ];
  }
}
```

### Validation Rules Configuration
```typescript
const validationRules: ValidationRuleConfig[] = [
  {
    rule: new SchemaValidationRule(),
    type: 'error',
    enabled: true,
  },
  {
    rule: new PerformanceValidationRule(),
    type: 'warning',
    enabled: true,
  },
  // ... more rules
];
```

## 🎨 Features in Action

- **Real-time Validation**: See errors and warnings as you type
- **Smart Autocomplete**: Context-aware suggestions with fuzzy matching
- **Variable Support**: Handle embedded variables with proper escaping
- **Custom Providers**: Add domain-specific completions
- **Performance Monitoring**: Get suggestions for query optimization

This example showcases the full power and extensibility of the SQL Editor package!
