# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Initial release of SQL Editor
- Core package (`@sql-editor/core`) with framework-agnostic functionality
- React package (`@sql-editor/react`) with React components
- Intelligent autocomplete with context awareness
- Full alias support for tables and CTEs
- Real-time SQL validation
- Syntax highlighting with Ace Editor
- Schema registry for managing database metadata
- Fuzzy matching for autocomplete suggestions
- Plugin architecture for extensibility
- Comprehensive TypeScript types
- TSDoc documentation throughout
- Basic example application
- Test infrastructure with Jest
- Build configuration with tsup
- Monorepo setup with pnpm workspaces

### Features

#### Core Package
- **Parser Service**: SQL parsing using dt-sql-parser
- **Schema Registry**: Efficient schema management and search
- **Autocomplete Engine**: Context-aware completion suggestions
  - Table completions
  - Column completions with alias support
  - SQL keyword completions
  - Function completions
- **Validator Service**: Syntax and semantic validation
- **Utilities**: Debounce, memoize, position helpers, logging

#### React Package
- **SQLEditor Component**: Main editor component with Ace integration
- **CompletionPopup Component**: Autocomplete suggestion popup
- **Custom Hooks**:
  - `useSQLEditor`: Main editor logic
  - `useAutocomplete`: Autocomplete functionality
  - `useValidation`: Validation handling
- Styled components with dark theme

### Documentation
- Technical architecture document
- Folder structure guide
- Comprehensive README
- Contributing guidelines
- API documentation (TSDoc)

## [0.1.0] - 2025-10-22

Initial development release.

