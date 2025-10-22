# Folder Structure Plan

## Overview
This document outlines the complete folder structure for the SQL Editor monorepo package.

## Root Structure

```
sql-editor/
├── .github/                    # GitHub workflows, issue templates
│   └── workflows/
│       ├── ci.yml             # CI/CD pipeline
│       ├── release.yml        # Release automation
│       └── docs.yml           # Documentation deployment
│
├── packages/                   # Monorepo packages
│   ├── core/                  # Core business logic (framework-agnostic)
│   └── react/                 # React-specific implementation
│
├── examples/                   # Example applications
│   ├── basic/                 # Basic usage example
│   ├── advanced/              # Advanced features showcase
│   └── playground/            # Interactive playground
│
├── docs/                       # Documentation site
│   ├── api/                   # API documentation (auto-generated)
│   ├── guides/                # User guides
│   └── images/                # Screenshots, diagrams
│
├── scripts/                    # Build and development scripts
│   ├── build.js               # Build all packages
│   ├── test.js                # Run all tests
│   ├── docs.js                # Generate documentation
│   └── release.js             # Release management
│
├── .gitignore                  # Git ignore patterns
├── .eslintrc.js               # ESLint configuration
├── .prettierrc                # Prettier configuration
├── tsconfig.base.json         # Base TypeScript config
├── jest.config.js             # Jest configuration
├── package.json               # Root package.json (workspace)
├── pnpm-workspace.yaml        # PNPM workspace config
├── README.md                  # Main README
├── ARCHITECTURE.md            # Technical architecture (created)
├── CONTRIBUTING.md            # Contribution guidelines
├── CHANGELOG.md               # Version history
└── LICENSE                    # License file
```

## Package: @sql-editor/core

```
packages/core/
├── src/
│   ├── parser/                      # Parser Service
│   │   ├── __tests__/
│   │   │   ├── parser-service.test.ts
│   │   │   ├── ast-analyzer.test.ts
│   │   │   └── context-detector.test.ts
│   │   ├── parser-service.ts        # Main parser service
│   │   ├── ast-analyzer.ts          # AST traversal and analysis
│   │   ├── context-detector.ts      # SQL context detection
│   │   ├── metadata-extractor.ts    # Extract tables, aliases, CTEs
│   │   ├── types.ts                 # Parser-specific types
│   │   └── index.ts                 # Public exports
│   │
│   ├── schema/                      # Schema Registry
│   │   ├── __tests__/
│   │   │   ├── schema-registry.test.ts
│   │   │   ├── schema-loader.test.ts
│   │   │   └── schema-index.test.ts
│   │   ├── schema-registry.ts       # Main registry implementation
│   │   ├── schema-loader.ts         # Load schema from various sources
│   │   ├── schema-index.ts          # Search index for fast lookups
│   │   ├── schema-cache.ts          # Caching layer
│   │   ├── types.ts                 # Schema types
│   │   └── index.ts
│   │
│   ├── autocomplete/                # Autocomplete Engine
│   │   ├── __tests__/
│   │   │   ├── autocomplete-engine.test.ts
│   │   │   ├── scope-resolver.test.ts
│   │   │   ├── completion-ranker.test.ts
│   │   │   └── providers/
│   │   │       ├── table-provider.test.ts
│   │   │       ├── column-provider.test.ts
│   │   │       └── keyword-provider.test.ts
│   │   ├── autocomplete-engine.ts   # Main autocomplete engine
│   │   ├── scope-resolver.ts        # Resolve available tables/aliases
│   │   ├── completion-ranker.ts     # Rank and filter suggestions
│   │   ├── fuzzy-matcher.ts         # Fuzzy matching algorithm
│   │   ├── providers/               # Completion providers
│   │   │   ├── base-provider.ts     # Abstract base provider
│   │   │   ├── table-provider.ts    # Table completions
│   │   │   ├── column-provider.ts   # Column completions
│   │   │   ├── keyword-provider.ts  # SQL keyword completions
│   │   │   ├── function-provider.ts # SQL function completions
│   │   │   ├── alias-provider.ts    # Alias completions
│   │   │   └── index.ts
│   │   ├── types.ts                 # Autocomplete types
│   │   └── index.ts
│   │
│   ├── validator/                   # Validation Service
│   │   ├── __tests__/
│   │   │   ├── validator-service.test.ts
│   │   │   └── rules/
│   │   │       ├── syntax-rule.test.ts
│   │   │       └── schema-rule.test.ts
│   │   ├── validator-service.ts     # Main validator
│   │   ├── rules/                   # Validation rules
│   │   │   ├── base-rule.ts         # Abstract base rule
│   │   │   ├── syntax-rule.ts       # Syntax validation
│   │   │   ├── schema-rule.ts       # Schema validation
│   │   │   └── index.ts
│   │   ├── types.ts
│   │   └── index.ts
│   │
│   ├── types/                       # Shared types
│   │   ├── common.ts                # Common types
│   │   ├── sql.ts                   # SQL-specific types
│   │   ├── config.ts                # Configuration types
│   │   ├── plugin.ts                # Plugin types
│   │   └── index.ts
│   │
│   ├── utils/                       # Utility functions
│   │   ├── __tests__/
│   │   │   ├── debounce.test.ts
│   │   │   ├── memoize.test.ts
│   │   │   └── position.test.ts
│   │   ├── debounce.ts              # Debounce utility
│   │   ├── memoize.ts               # Memoization utility
│   │   ├── position.ts              # Position helpers
│   │   ├── logger.ts                # Logging utility
│   │   └── index.ts
│   │
│   └── index.ts                     # Main entry point
│
├── package.json                     # Package manifest
├── tsconfig.json                    # TypeScript config
├── README.md                        # Package README
└── LICENSE
```

## Package: @sql-editor/react

```
packages/react/
├── src/
│   ├── components/                  # React components
│   │   ├── __tests__/
│   │   │   ├── SQLEditor.test.tsx
│   │   │   ├── CompletionPopup.test.tsx
│   │   │   ├── ErrorMarker.test.tsx
│   │   │   └── Toolbar.test.tsx
│   │   ├── SQLEditor/               # Main editor component
│   │   │   ├── SQLEditor.tsx        # Main component
│   │   │   ├── SQLEditor.styles.ts  # Styled components/CSS
│   │   │   ├── ace-mode.ts          # Custom Ace mode
│   │   │   ├── ace-theme.ts         # Custom Ace theme
│   │   │   └── index.ts
│   │   ├── CompletionPopup/         # Autocomplete popup
│   │   │   ├── CompletionPopup.tsx
│   │   │   ├── CompletionItem.tsx
│   │   │   ├── CompletionPopup.styles.ts
│   │   │   └── index.ts
│   │   ├── ErrorMarker/             # Error display
│   │   │   ├── ErrorMarker.tsx
│   │   │   ├── ErrorTooltip.tsx
│   │   │   └── index.ts
│   │   ├── Toolbar/                 # Optional toolbar
│   │   │   ├── Toolbar.tsx
│   │   │   ├── Toolbar.styles.ts
│   │   │   └── index.ts
│   │   └── index.ts
│   │
│   ├── hooks/                       # Custom React hooks
│   │   ├── __tests__/
│   │   │   ├── useSQLEditor.test.ts
│   │   │   ├── useAutocomplete.test.ts
│   │   │   └── useValidation.test.ts
│   │   ├── useSQLEditor.ts          # Main editor hook
│   │   ├── useAutocomplete.ts       # Autocomplete hook
│   │   ├── useValidation.ts         # Validation hook
│   │   ├── useSchema.ts             # Schema hook
│   │   └── index.ts
│   │
│   ├── context/                     # React context
│   │   ├── SQLEditorContext.tsx     # Editor context
│   │   ├── SchemaContext.tsx        # Schema context
│   │   └── index.ts
│   │
│   ├── providers/                   # React providers
│   │   ├── SQLEditorProvider.tsx    # Main provider
│   │   └── index.ts
│   │
│   ├── types/                       # React-specific types
│   │   ├── props.ts                 # Component props
│   │   ├── hooks.ts                 # Hook types
│   │   └── index.ts
│   │
│   └── index.ts                     # Main entry point
│
├── package.json
├── tsconfig.json
├── README.md
└── LICENSE
```

## Example: Basic

```
examples/basic/
├── src/
│   ├── App.tsx                      # Main app component
│   ├── main.tsx                     # Entry point
│   ├── data/
│   │   └── sample-schema.ts         # Sample database schema
│   └── styles/
│       └── global.css               # Global styles
│
├── public/
│   └── index.html                   # HTML template
│
├── package.json
├── tsconfig.json
├── vite.config.ts                   # Vite configuration
└── README.md
```

## Example: Advanced

```
examples/advanced/
├── src/
│   ├── App.tsx
│   ├── main.tsx
│   ├── features/
│   │   ├── CustomCompletion.tsx     # Custom completion provider
│   │   ├── CustomValidator.tsx      # Custom validator
│   │   └── CustomTheme.tsx          # Custom theme
│   ├── data/
│   │   └── complex-schema.ts        # Complex schema with multiple DBs
│   └── styles/
│
├── public/
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

## Naming Conventions

### Files
- **Components**: PascalCase (e.g., `SQLEditor.tsx`)
- **Hooks**: camelCase with 'use' prefix (e.g., `useSQLEditor.ts`)
- **Services**: kebab-case (e.g., `parser-service.ts`)
- **Types**: kebab-case with .types.ts suffix (e.g., `common.types.ts`) OR `types.ts` in folders
- **Tests**: Same as source with `.test.ts(x)` suffix
- **Utils**: kebab-case (e.g., `debounce.ts`)

### Exports
- **Named exports** for everything (no default exports except components)
- **Barrel exports** via `index.ts` files
- **Type-only exports** clearly marked

### Directories
- **kebab-case** for all directories
- **__tests__** for test files (co-located with source)
- **Group by feature**, not by type (within reason)

## Build Artifacts

```
packages/core/dist/
├── index.js                         # ESM build
├── index.cjs                        # CommonJS build
├── index.d.ts                       # Type declarations
└── index.d.ts.map                   # Source map for types

packages/react/dist/
├── index.js
├── index.cjs
├── index.d.ts
├── index.d.ts.map
└── styles.css                       # Bundled styles
```

## Key Design Decisions

### 1. Monorepo Structure
- **Why**: Separate framework-agnostic core from React implementation
- **Benefit**: Enables future Vue/Angular/Svelte packages
- **Tool**: PNPM workspaces for fast, efficient dependency management

### 2. Co-located Tests
- **Why**: Keep tests close to source code
- **Benefit**: Easier to maintain, clear test organization
- **Pattern**: `__tests__` directories alongside source

### 3. Barrel Exports
- **Why**: Clean public API, hide internal implementation
- **Benefit**: Better tree-shaking, controlled exports
- **Pattern**: `index.ts` files in each directory

### 4. Separate Types Directory
- **Why**: Shared types used across multiple modules
- **Benefit**: Avoid circular dependencies, single source of truth
- **Location**: `packages/core/src/types/`

### 5. Provider Pattern
- **Why**: Extensibility through providers (completions, validators)
- **Benefit**: Easy to add custom behavior without modifying core
- **Example**: `table-provider.ts`, `column-provider.ts`

## Development Workflow

1. **Install dependencies**: `pnpm install`
2. **Build all packages**: `pnpm build`
3. **Run tests**: `pnpm test`
4. **Run specific package**: `pnpm --filter @sql-editor/core test`
5. **Run example**: `pnpm --filter basic dev`
6. **Generate docs**: `pnpm docs:build`
7. **Lint**: `pnpm lint`
8. **Type check**: `pnpm type-check`

## Package Publishing

- **Core package**: `@sql-editor/core`
- **React package**: `@sql-editor/react`
- **Versioning**: Semantic versioning (semver)
- **Registry**: NPM
- **Access**: Public
- **Documentation**: Auto-published to GitHub Pages

## Migration Path

For existing implementations:
1. Install `@sql-editor/react`
2. Import `<SQLEditor>` component
3. Provide schema via `schema` prop
4. Migrate custom features to plugins
5. Remove old implementation

## Future Packages

- `@sql-editor/vue`: Vue 3 implementation
- `@sql-editor/angular`: Angular implementation
- `@sql-editor/worker`: Web Worker for parsing
- `@sql-editor/server`: Node.js server utilities
- `@sql-editor/formatter`: SQL formatting package

