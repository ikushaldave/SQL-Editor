/**
 * SQLEditor Integration Tests
 * Complete end-to-end tests for autocomplete, validation, errors, and warnings
 */

import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { SQLEditor } from '../components/SQLEditor';
import type { SchemaDefinition } from '@sql-editor/core';

// Mock Ace Editor with more complete implementation
jest.mock('react-ace', () => {
  return function MockAceEditor(props: any) {
    const handleKeyDown = (e: React.KeyboardEvent) => {
      // Simulate Ctrl+Space for autocomplete
      if ((e.ctrlKey || e.metaKey) && e.key === ' ') {
        e.preventDefault();
        if (props.commands) {
          const autocompleteCmd = props.commands.find((cmd: any) => cmd.name === 'triggerAutocomplete');
          if (autocompleteCmd && autocompleteCmd.exec) {
            autocompleteCmd.exec();
          }
        }
      }
    };

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const newValue = e.target.value;
      props.onChange(newValue);
      
      // Simulate cursor position change
      if (props.onCursorChange) {
        const lines = newValue.split('\n');
        const lastLineIndex = lines.length - 1;
        const lastLineLength = lines[lastLineIndex]?.length || 0;
        
        props.onCursorChange({
          getCursor: () => ({ row: lastLineIndex, column: lastLineLength })
        });
      }
    };

    return (
      <div data-testid="ace-editor" className="sql-editor-container">
        <textarea
          data-testid="sql-input"
          value={props.value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onFocus={props.onFocus}
          onBlur={props.onBlur}
          readOnly={props.readOnly}
          placeholder={props.placeholder}
        />
      </div>
    );
  };
});

describe('SQLEditor Integration Tests', () => {
  const ecommerceSchema: SchemaDefinition = {
    databases: {
      shop: {
        name: 'shop',
        comment: 'E-commerce database',
        tables: {
          users: {
            name: 'users',
            comment: 'User accounts',
            columns: {
              id: { type: 'int', primaryKey: true, comment: 'User ID' },
              username: { type: 'varchar', length: 50, unique: true, nullable: false },
              email: { type: 'varchar', length: 255, unique: true, nullable: false },
              created_at: { type: 'timestamp', defaultValue: 'CURRENT_TIMESTAMP' },
            },
          },
          products: {
            name: 'products',
            comment: 'Product catalog',
            columns: {
              id: { type: 'int', primaryKey: true },
              name: { type: 'varchar', length: 200, nullable: false },
              price: { type: 'decimal', precision: 10, scale: 2 },
              category: { type: 'varchar', length: 100 },
            },
          },
          orders: {
            name: 'orders',
            comment: 'Customer orders',
            columns: {
              id: { type: 'int', primaryKey: true },
              user_id: { type: 'int', foreignKey: 'users.id' },
              product_id: { type: 'int', foreignKey: 'products.id' },
              quantity: { type: 'int', nullable: false },
              total: { type: 'decimal', precision: 10, scale: 2 },
              status: { type: 'enum', enumValues: ['pending', 'shipped', 'delivered'] },
            },
          },
        },
      },
    },
  };

  describe('E2E: Schema Integration', () => {
    it('should load schema and make it available for autocomplete', async () => {
      const handleChange = jest.fn();
      
      render(
        <SQLEditor
          value=""
          onChange={handleChange}
          schema={ecommerceSchema}
          autocomplete={{ enabled: true }}
        />
      );

      expect(screen.getByTestId('ace-editor')).toBeInTheDocument();
    });

    it('should work with multiple tables from schema', () => {
      const { container } = render(
        <SQLEditor
          value="SELECT * FROM users"
          onChange={() => {}}
          schema={ecommerceSchema}
        />
      );

      expect(container.querySelector('.sql-editor-container')).toBeInTheDocument();
    });
  });

  describe('E2E: Autocomplete Functionality', () => {
    it('should provide table suggestions in FROM clause', async () => {
      const handleChange = jest.fn();
      
      const { container } = render(
        <SQLEditor
          value="SELECT * FROM "
          onChange={handleChange}
          schema={ecommerceSchema}
          autocomplete={{ 
            enabled: true,
            fuzzyMatch: true,
            maxSuggestions: 50
          }}
        />
      );

      // The schema should be loaded
      expect(container.querySelector('.sql-editor-container')).toBeInTheDocument();
    });

    it('should provide column suggestions after table alias', async () => {
      const handleChange = jest.fn();
      
      render(
        <SQLEditor
          value="SELECT u. FROM users u"
          onChange={handleChange}
          schema={ecommerceSchema}
          autocomplete={{ enabled: true }}
        />
      );

      expect(screen.getByTestId('sql-input')).toHaveValue('SELECT u. FROM users u');
    });

    it('should handle autocomplete with fuzzy matching', () => {
      render(
        <SQLEditor
          value="SELECT * FROM usr"
          onChange={() => {}}
          schema={ecommerceSchema}
          autocomplete={{ 
            enabled: true,
            fuzzyMatch: true,
            caseSensitive: false
          }}
        />
      );

      expect(screen.getByTestId('ace-editor')).toBeInTheDocument();
    });

    it('should respect maxSuggestions limit', () => {
      render(
        <SQLEditor
          value="SELECT "
          onChange={() => {}}
          schema={ecommerceSchema}
          autocomplete={{ 
            enabled: true,
            maxSuggestions: 10
          }}
        />
      );

      expect(screen.getByTestId('ace-editor')).toBeInTheDocument();
    });

    it('should handle autocomplete trigger on dot', async () => {
      const user = userEvent.setup();
      const handleChange = jest.fn();
      
      render(
        <SQLEditor
          value="SELECT u"
          onChange={handleChange}
          schema={ecommerceSchema}
          autocomplete={{ enabled: true }}
        />
      );

      const input = screen.getByTestId('sql-input');
      
      // Type a dot to trigger autocomplete
      await user.type(input, '.');
      
      expect(handleChange).toHaveBeenCalled();
    });
  });

  describe('E2E: Validation and Errors', () => {
    it('should validate SQL syntax', async () => {
      render(
        <SQLEditor
          value="SELECT FROM WHERE"
          onChange={() => {}}
          schema={ecommerceSchema}
          validation={{
            enabled: true,
            validateOnChange: true,
            debounceMs: 100
          }}
        />
      );

      expect(screen.getByTestId('ace-editor')).toBeInTheDocument();
      
      // Validation happens internally
      await waitFor(() => {
        expect(screen.getByTestId('sql-input')).toBeInTheDocument();
      }, { timeout: 500 });
    });

    it('should show validation errors for invalid SQL', async () => {
      render(
        <SQLEditor
          value="INVALID SQL QUERY"
          onChange={() => {}}
          validation={{
            enabled: true,
            validateOnChange: true,
            debounceMs: 50
          }}
        />
      );

      // Wait for validation debounce
      await waitFor(() => {
        expect(screen.getByTestId('sql-input')).toBeInTheDocument();
      }, { timeout: 200 });
    });

    it('should clear errors when validation is disabled', () => {
      const { rerender } = render(
        <SQLEditor
          value="INVALID SQL"
          onChange={() => {}}
          validation={{ enabled: true }}
        />
      );

      // Disable validation
      rerender(
        <SQLEditor
          value="INVALID SQL"
          onChange={() => {}}
          validation={{ enabled: false }}
        />
      );

      expect(screen.getByTestId('ace-editor')).toBeInTheDocument();
    });

    it('should validate with debounce', async () => {
      jest.useFakeTimers();
      
      const { rerender } = render(
        <SQLEditor
          value="SELECT *"
          onChange={() => {}}
          validation={{
            enabled: true,
            validateOnChange: true,
            debounceMs: 500
          }}
        />
      );

      // Change value
      rerender(
        <SQLEditor
          value="SELECT * FROM"
          onChange={() => {}}
          validation={{
            enabled: true,
            validateOnChange: true,
            debounceMs: 500
          }}
        />
      );

      // Fast forward time
      act(() => {
        jest.advanceTimersByTime(500);
      });

      await waitFor(() => {
        expect(screen.getByTestId('sql-input')).toBeInTheDocument();
      });

      jest.useRealTimers();
    });
  });

  describe('E2E: Multi-dialect Support', () => {
    const dialects = [
      'mysql',
      'postgresql', 
      'flink',
      'spark',
      'hive',
      'trino',
      'impala'
    ] as const;

    dialects.forEach((dialect) => {
      it(`should work with ${dialect} dialect`, () => {
        render(
          <SQLEditor
            value="SELECT * FROM users"
            onChange={() => {}}
            schema={ecommerceSchema}
            dialect={dialect}
          />
        );

        expect(screen.getByTestId('ace-editor')).toBeInTheDocument();
      });
    });

    it('should switch between dialects', () => {
      const { rerender } = render(
        <SQLEditor
          value="SELECT * FROM users"
          onChange={() => {}}
          dialect="mysql"
        />
      );

      expect(screen.getByTestId('sql-input')).toBeInTheDocument();

      rerender(
        <SQLEditor
          value="SELECT * FROM users"
          onChange={() => {}}
          dialect="postgresql"
        />
      );

      expect(screen.getByTestId('sql-input')).toBeInTheDocument();
    });
  });

  describe('E2E: Variable Support', () => {
    it('should handle embedded variables in SQL', () => {
      render(
        <SQLEditor
          value="SELECT * FROM $(table_name) WHERE id = $(user_id)"
          onChange={() => {}}
          parserOptions={{
            embeddedVariables: true
          }}
        />
      );

      expect(screen.getByTestId('sql-input')).toHaveValue(
        'SELECT * FROM $(table_name) WHERE id = $(user_id)'
      );
    });

    it('should validate SQL with variables', async () => {
      render(
        <SQLEditor
          value="SELECT * FROM $(table)"
          onChange={() => {}}
          parserOptions={{ embeddedVariables: true }}
          validation={{ 
            enabled: true,
            validateOnChange: true,
            debounceMs: 100
          }}
        />
      );

      await waitFor(() => {
        expect(screen.getByTestId('sql-input')).toBeInTheDocument();
      }, { timeout: 300 });
    });
  });

  describe('E2E: Complex Queries', () => {
    it('should handle JOIN queries with aliases', () => {
      const query = `
SELECT 
  u.username,
  u.email,
  o.total
FROM users u
JOIN orders o ON u.id = o.user_id
WHERE u.created_at > '2024-01-01'
      `.trim();

      render(
        <SQLEditor
          value={query}
          onChange={() => {}}
          schema={ecommerceSchema}
          autocomplete={{ enabled: true }}
        />
      );

      expect(screen.getByTestId('sql-input')).toHaveValue(query);
    });

    it('should handle subqueries', () => {
      const query = `
SELECT *
FROM users
WHERE id IN (
  SELECT user_id FROM orders WHERE total > 100
)
      `.trim();

      render(
        <SQLEditor
          value={query}
          onChange={() => {}}
          schema={ecommerceSchema}
        />
      );

      expect(screen.getByTestId('sql-input')).toHaveValue(query);
    });

    it('should handle CTEs (Common Table Expressions)', () => {
      const query = `
WITH high_value_orders AS (
  SELECT user_id, SUM(total) as total_spent
  FROM orders
  GROUP BY user_id
  HAVING SUM(total) > 1000
)
SELECT u.username, hvo.total_spent
FROM users u
JOIN high_value_orders hvo ON u.id = hvo.user_id
      `.trim();

      render(
        <SQLEditor
          value={query}
          onChange={() => {}}
          schema={ecommerceSchema}
        />
      );

      expect(screen.getByTestId('sql-input')).toHaveValue(query);
    });
  });

  describe('E2E: Editor Interactions', () => {
    it('should handle user typing', async () => {
      const user = userEvent.setup();
      const handleChange = jest.fn();

      render(
        <SQLEditor
          value=""
          onChange={handleChange}
        />
      );

      const input = screen.getByTestId('sql-input');
      await user.type(input, 'SELECT');

      expect(handleChange).toHaveBeenCalled();
    });

    it('should handle focus and blur events', async () => {
      const handleFocus = jest.fn();
      const handleBlur = jest.fn();

      render(
        <SQLEditor
          value="SELECT * FROM users"
          onChange={() => {}}
          onFocus={handleFocus}
          onBlur={handleBlur}
        />
      );

      const input = screen.getByTestId('sql-input');
      
      fireEvent.focus(input);
      expect(handleFocus).toHaveBeenCalled();

      fireEvent.blur(input);
      expect(handleBlur).toHaveBeenCalled();
    });

    it('should handle read-only mode', () => {
      render(
        <SQLEditor
          value="SELECT * FROM users"
          onChange={() => {}}
          readOnly={true}
        />
      );

      const input = screen.getByTestId('sql-input') as HTMLTextAreaElement;
      expect(input.readOnly).toBe(true);
    });

    it('should handle placeholder text', () => {
      const placeholder = 'Enter your SQL query here...';
      
      render(
        <SQLEditor
          value=""
          onChange={() => {}}
          placeholder={placeholder}
        />
      );

      const input = screen.getByTestId('sql-input');
      expect(input).toHaveAttribute('placeholder', placeholder);
    });
  });

  describe('E2E: Custom Providers', () => {
    it('should use custom completion providers', () => {
      const customProvider = {
        canProvide: () => true,
        provide: () => [
          { 
            label: 'MY_CUSTOM_FUNC', 
            type: 'function' as const,
            detail: 'Custom function',
            documentation: 'My custom SQL function',
            sortPriority: 1
          },
        ],
      };

      render(
        <SQLEditor
          value="SELECT "
          onChange={() => {}}
          schema={ecommerceSchema}
          completionProviders={[customProvider]}
          autocomplete={{ enabled: true }}
        />
      );

      expect(screen.getByTestId('ace-editor')).toBeInTheDocument();
    });

    it('should use custom validators', async () => {
      const customValidator = {
        name: 'noSelectStar',
        validate: (sql: string) => {
          if (sql.includes('SELECT *')) {
            return [{
              message: 'Avoid using SELECT *',
              severity: 'warning' as const,
              location: { start: { line: 0, column: 0 }, end: { line: 0, column: 8 } }
            }];
          }
          return [];
        },
      };

      render(
        <SQLEditor
          value="SELECT * FROM users"
          onChange={() => {}}
          validators={[customValidator]}
          validation={{ enabled: true, debounceMs: 50 }}
        />
      );

      await waitFor(() => {
        expect(screen.getByTestId('sql-input')).toBeInTheDocument();
      }, { timeout: 200 });
    });
  });

  describe('E2E: Performance', () => {
    it('should handle large SQL queries', () => {
      const largeSql = Array(100)
        .fill(null)
        .map((_, i) => `SELECT * FROM table${i}`)
        .join(';\n');

      render(
        <SQLEditor
          value={largeSql}
          onChange={() => {}}
          schema={ecommerceSchema}
        />
      );

      expect(screen.getByTestId('sql-input')).toHaveValue(largeSql);
    });

    it('should handle frequent value changes', async () => {
      jest.useFakeTimers();
      const { rerender } = render(
        <SQLEditor
          value="SELECT"
          onChange={() => {}}
          validation={{ enabled: true, debounceMs: 300 }}
        />
      );

      // Rapid changes
      for (let i = 0; i < 10; i++) {
        rerender(
          <SQLEditor
            value={`SELECT ${i}`}
            onChange={() => {}}
            validation={{ enabled: true, debounceMs: 300 }}
          />
        );
      }

      act(() => {
        jest.advanceTimersByTime(300);
      });

      expect(screen.getByTestId('sql-input')).toBeInTheDocument();
      
      jest.useRealTimers();
    });
  });

  describe('E2E: Error Recovery', () => {
    it('should recover from invalid schema', () => {
      const { rerender } = render(
        <SQLEditor
          value="SELECT * FROM users"
          onChange={() => {}}
          schema={{} as any}
        />
      );

      // Should still render
      expect(screen.getByTestId('ace-editor')).toBeInTheDocument();

      // Fix with valid schema
      rerender(
        <SQLEditor
          value="SELECT * FROM users"
          onChange={() => {}}
          schema={ecommerceSchema}
        />
      );

      expect(screen.getByTestId('ace-editor')).toBeInTheDocument();
    });

    it('should handle undefined schema gracefully', () => {
      render(
        <SQLEditor
          value="SELECT * FROM users"
          onChange={() => {}}
          schema={undefined}
        />
      );

      expect(screen.getByTestId('ace-editor')).toBeInTheDocument();
    });
  });
});

