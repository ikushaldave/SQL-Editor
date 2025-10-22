# SQL Editor - Technical Architecture

## Overview

A scalable, extensible SQL editor library built with React, Ace Editor, and dt-sql-parser. This package provides intelligent autocomplete, syntax highlighting, and advanced SQL parsing capabilities with support for table aliases, CTEs, subqueries, and more.

## Core Principles

1. **Modularity**: Each feature is isolated in its own module with clear interfaces
2. **Extensibility**: Plugin-based architecture for custom completions and validators
3. **Type Safety**: Full TypeScript support with strict typing
4. **Testability**: Test-driven development with high coverage
5. **Performance**: Lazy loading, memoization, and worker threads for heavy parsing
6. **Framework Agnostic Core**: Business logic separated from React components

## Architecture Layers

```
┌─────────────────────────────────────────────────────────┐
│                    Presentation Layer                    │
│  (React Components - Editor, Toolbar, Results Display)   │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│                   Application Layer                      │
│     (Hooks, State Management, Event Orchestration)       │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│                     Service Layer                        │
│  (Parser Service, Autocomplete Engine, Validator)        │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│                      Core Layer                          │
│    (AST Analysis, Schema Registry, Token Provider)       │
└─────────────────────────────────────────────────────────┘
```

## Core Components

### 1. Parser Service
**Responsibility**: SQL parsing and AST analysis

- Wraps dt-sql-parser with enhanced error handling
- Provides AST traversal utilities
- Extracts metadata (tables, columns, aliases, CTEs)
- Detects SQL context (SELECT, FROM, WHERE, JOIN, etc.)

**Key Interfaces**:
```typescript
interface IParserService {
  parse(sql: string, dialect: SQLDialect): ParseResult;
  extractTableRefs(ast: AST): TableReference[];
  extractAliases(ast: AST): AliasMap;
  getContextAtPosition(sql: string, position: Position): SQLContext;
}
```

### 2. Schema Registry
**Responsibility**: Manage database schema metadata

- Store and retrieve table/column definitions
- Support multiple databases/schemas
- Handle schema updates and invalidation
- Provide schema search and filtering

**Key Interfaces**:
```typescript
interface ISchemaRegistry {
  registerSchema(schema: SchemaDefinition): void;
  getTable(tableName: string, database?: string): TableDefinition | null;
  getColumns(tableName: string): ColumnDefinition[];
  search(query: string, context?: SQLContext): SchemaItem[];
}
```

### 3. Autocomplete Engine
**Responsibility**: Generate intelligent completion suggestions

**Features**:
- Context-aware suggestions (knows when to suggest tables vs columns)
- Alias resolution (understands `u.name` when `users u` is defined)
- CTE (Common Table Expression) support
- Subquery column inference
- Keyword completion with syntax templates
- Custom completion providers via plugins

**Key Interfaces**:
```typescript
interface IAutocompleteEngine {
  getSuggestions(
    sql: string,
    position: Position,
    schema: ISchemaRegistry
  ): Completion[];
  
  registerProvider(provider: CompletionProvider): void;
  setOptions(options: AutocompleteOptions): void;
}
```

**Completion Flow**:
```
User Input → Parse SQL → Determine Context → Resolve Scope 
  → Match Schema → Rank Suggestions → Return Completions
```

### 4. Validator Service
**Responsibility**: SQL validation and error reporting

- Syntax errors from parser
- Semantic validation (undefined tables/columns)
- Custom validation rules via plugins
- Error recovery and suggestions

### 5. SQL Editor Component
**Responsibility**: Main React component integrating all services

**Features**:
- Ace Editor integration with custom mode
- Real-time syntax highlighting
- Autocomplete popup rendering
- Error markers and tooltips
- Configurable keybindings
- Theme support

## Plugin System

### Plugin Architecture
```typescript
interface Plugin {
  name: string;
  version: string;
  
  // Lifecycle hooks
  onInit?(editor: SQLEditor): void;
  onDestroy?(): void;
  
  // Extension points
  completionProviders?: CompletionProvider[];
  validators?: Validator[];
  commands?: Command[];
}
```

### Built-in Plugins (Future)
- **Function completion**: SQL function signatures with inline docs
- **Snippet expansion**: Common SQL patterns
- **Format on save**: SQL formatting/beautification
- **Query history**: Recent queries with search

## Data Flow

### Autocomplete Flow
```
1. User types → keypress event
2. Editor detects trigger character (., space, etc.)
3. Get cursor position and surrounding SQL
4. Parser Service: Parse SQL + extract context
5. Scope Resolver: Determine available tables/aliases at position
6. Schema Registry: Fetch matching schema items
7. Autocomplete Engine: Generate & rank suggestions
8. React Component: Render completion popup
9. User selects → insert completion
```

### Validation Flow
```
1. SQL content changes (debounced)
2. Parser Service: Parse full SQL
3. Validator Service: Run validation rules
   - Syntax errors from AST
   - Schema validation (undefined references)
   - Custom plugin validators
4. Editor: Display error markers and tooltips
```

## Performance Optimizations

### 1. Parsing Strategy
- **Incremental parsing**: Only re-parse changed sections when possible
- **Web Worker**: Offload heavy parsing to background thread
- **Caching**: Memoize AST and metadata for unchanged SQL
- **Debouncing**: Delay validation on rapid typing

### 2. Schema Management
- **Lazy loading**: Fetch schema on-demand
- **Indexing**: Pre-build search indices for fast lookups
- **Virtual scrolling**: Handle large schema lists efficiently

### 3. Autocomplete
- **Fuzzy matching**: Fast fuzzy search with early termination
- **Result limiting**: Cap suggestions at configurable limit
- **Prioritization**: Rank by relevance to avoid processing all items

## Technology Stack

### Core Dependencies
- **React** (^18.x): UI framework
- **TypeScript** (^5.x): Type system
- **Ace Editor** (^1.x): Code editor
- **dt-sql-parser** (^4.x): SQL parser
- **fuse.js**: Fuzzy search for completions

### Development Dependencies
- **Jest**: Testing framework
- **React Testing Library**: Component testing
- **TypeDoc**: Documentation generation
- **Rollup/Vite**: Package bundling
- **ESLint/Prettier**: Code quality

## Testing Strategy

### Unit Tests
- Each service/module tested in isolation
- Mock dependencies via dependency injection
- High coverage target (>90%)

### Integration Tests
- Test service interactions (Parser → Autocomplete → Editor)
- Schema registry with autocomplete engine
- Validation pipeline

### Component Tests
- React Testing Library for UI components
- User interaction flows (typing, selecting completions)
- Accessibility testing

### E2E Tests (Future)
- Full editor scenarios in example app
- Performance benchmarks
- Cross-browser testing

## Package Structure

```
sql-editor/
├── packages/
│   ├── core/              # Framework-agnostic business logic
│   │   ├── parser/        # Parser service
│   │   ├── schema/        # Schema registry
│   │   ├── autocomplete/  # Completion engine
│   │   ├── validator/     # Validation service
│   │   └── types/         # Shared types
│   │
│   └── react/             # React-specific components
│       ├── components/    # React components
│       ├── hooks/         # Custom hooks
│       └── context/       # React context providers
│
├── examples/              # Demo applications
│   └── basic/             # Basic usage example
│
├── docs/                  # Additional documentation
└── scripts/               # Build and dev scripts
```

## Extensibility Points

### 1. Custom Completion Providers
```typescript
class MyCompletionProvider implements CompletionProvider {
  canProvide(context: SQLContext): boolean {
    return context.type === 'function';
  }
  
  provide(context: SQLContext, schema: ISchemaRegistry): Completion[] {
    // Return custom completions
  }
}

editor.registerCompletionProvider(new MyCompletionProvider());
```

### 2. Custom Validators
```typescript
class MyValidator implements Validator {
  validate(sql: string, ast: AST, schema: ISchemaRegistry): ValidationError[] {
    // Custom validation logic
  }
}

editor.registerValidator(new MyValidator());
```

### 3. Custom Commands
```typescript
editor.registerCommand({
  name: 'formatSQL',
  bindKey: { win: 'Ctrl-Shift-F', mac: 'Cmd-Shift-F' },
  exec: (editor) => {
    // Format SQL
  }
});
```

## Future Enhancements

1. **Multi-dialect support**: PostgreSQL, MySQL, SQL Server, Oracle
2. **Query execution**: Integrate with database connections
3. **Schema inference**: Learn schema from executed queries
4. **AI-powered completions**: ML-based suggestion ranking
5. **Collaborative editing**: Real-time multi-user support
6. **Query visualization**: Visual query builder
7. **Performance insights**: Query explain plan visualization

## Configuration

### Editor Options
```typescript
interface SQLEditorOptions {
  // Editor behavior
  dialect: 'mysql' | 'postgresql' | 'mssql' | 'oracle';
  theme: string;
  fontSize: number;
  tabSize: number;
  
  // Autocomplete
  autocomplete: {
    enabled: boolean;
    triggerCharacters: string[];
    debounceMs: number;
    maxSuggestions: number;
    fuzzyMatch: boolean;
  };
  
  // Validation
  validation: {
    enabled: boolean;
    debounceMs: number;
    validateOnChange: boolean;
  };
  
  // Schema
  schema: {
    lazyLoad: boolean;
    caseSensitive: boolean;
  };
}
```

## API Design Goals

1. **Simple defaults**: Works out-of-box with minimal config
2. **Progressive enhancement**: Add features as needed
3. **Type safety**: Full IntelliSense support
4. **Documented**: Every public API has TSDoc
5. **Stable**: Semantic versioning, deprecation warnings

## Success Metrics

1. Bundle size < 200KB (minified + gzipped)
2. Initial render < 100ms
3. Autocomplete latency < 50ms (p95)
4. Test coverage > 90%
5. Zero critical security vulnerabilities
6. 100% TSDoc coverage for public APIs

