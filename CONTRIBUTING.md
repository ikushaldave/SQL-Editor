# Contributing to SQL Editor

Thank you for your interest in contributing to SQL Editor! This document provides guidelines and instructions for contributing.

## Code of Conduct

Please be respectful and constructive in all interactions with the community.

## Getting Started

### Prerequisites

- Node.js >= 18
- PNPM >= 8

### Setup Development Environment

1. Fork and clone the repository:
```bash
git clone https://github.com/yourusername/sql-editor.git
cd sql-editor
```

2. Install dependencies:
```bash
pnpm install
```

3. Build all packages:
```bash
pnpm build
```

4. Run tests:
```bash
pnpm test
```

## Development Workflow

### Project Structure

```
sql-editor/
├── packages/
│   ├── core/          # Framework-agnostic core
│   └── react/         # React components
├── examples/          # Example applications
└── docs/              # Documentation
```

### Making Changes

1. Create a new branch:
```bash
git checkout -b feature/your-feature-name
```

2. Make your changes following our coding standards

3. Add tests for your changes

4. Run tests and linting:
```bash
pnpm test
pnpm lint
pnpm type-check
```

5. Commit your changes:
```bash
git commit -m "feat: add your feature description"
```

We follow [Conventional Commits](https://www.conventionalcommits.org/):
- `feat:` New features
- `fix:` Bug fixes
- `docs:` Documentation changes
- `style:` Code style changes (formatting, etc.)
- `refactor:` Code refactoring
- `test:` Adding or updating tests
- `chore:` Maintenance tasks

### Testing

- Write tests for all new features
- Ensure all tests pass before submitting PR
- Aim for >80% code coverage
- Use meaningful test descriptions

Example test:
```typescript
describe('SchemaRegistry', () => {
  it('should register and retrieve a schema', () => {
    const registry = new SchemaRegistry();
    registry.registerSchema(schema);
    expect(registry.getTable('users')).toBeDefined();
  });
});
```

### Documentation

- Add TSDoc comments to all public APIs
- Update README files when adding features
- Add examples for new functionality
- Keep ARCHITECTURE.md updated for structural changes

Example TSDoc:
```typescript
/**
 * Parse SQL and return detailed results
 *
 * @param sql - SQL string to parse
 * @returns Parse result with AST, errors, and metadata
 *
 * @example
 * ```typescript
 * const result = parser.parse('SELECT * FROM users');
 * ```
 */
parse(sql: string): ParseResult {
  // implementation
}
```

## Submitting Changes

### Pull Request Process

1. Update documentation if needed
2. Add tests for your changes
3. Ensure all tests pass
4. Update CHANGELOG.md (if applicable)
5. Submit pull request with clear description

### PR Title Format

Use conventional commit format:
- `feat: add column filtering to autocomplete`
- `fix: resolve alias detection bug`
- `docs: update README with new examples`

### PR Description Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
How has this been tested?

## Checklist
- [ ] Tests pass locally
- [ ] Added/updated tests
- [ ] Added/updated documentation
- [ ] Follows code style guidelines
```

## Coding Standards

### TypeScript

- Use strict TypeScript settings
- Prefer `type` over `interface` for type aliases
- Use `const` over `let` when possible
- Avoid `any` - use `unknown` if type is truly unknown

### Code Style

- Follow existing code formatting (Prettier)
- Use meaningful variable names
- Keep functions small and focused
- Add comments for complex logic
- Export types alongside implementations

### File Organization

```
module/
├── __tests__/           # Tests co-located with code
│   └── module.test.ts
├── module.ts            # Main implementation
├── types.ts             # Module-specific types
└── index.ts             # Public exports
```

## Adding New Features

### Completion Providers

To add a new completion provider:

1. Create provider in `packages/core/src/autocomplete/providers/`
2. Implement `CompletionProvider` interface
3. Add tests
4. Export from `providers/index.ts`
5. Register in default providers (if applicable)

Example:
```typescript
export class MyProvider implements CompletionProvider {
  canProvide(context: SQLContext): boolean {
    return context.type === 'my_context';
  }

  provide(context: SQLContext, schema: SchemaRegistry): Completion[] {
    return [/* completions */];
  }
}
```

### Validators

To add a new validator:

1. Create validator in `packages/core/src/validator/rules/`
2. Implement `Validator` interface
3. Add tests
4. Document usage

## Release Process

(For maintainers)

1. Update version in package.json files
2. Update CHANGELOG.md
3. Create git tag
4. Push to GitHub
5. Publish to npm

## Questions?

- Open an issue for bugs or feature requests
- Join discussions for general questions
- Check existing issues and PRs first

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

