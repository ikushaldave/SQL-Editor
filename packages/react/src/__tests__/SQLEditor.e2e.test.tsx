/**
 * SQLEditor End-to-End Tests
 * Tests the complete editor functionality
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { SQLEditor } from '../components/SQLEditor';
import type { SchemaDefinition } from '@sql-editor/core';

// Mock Ace Editor
jest.mock('react-ace', () => {
  return function MockAceEditor(props: any) {
    return (
      <div data-testid="ace-editor">
        <textarea
          value={props.value}
          onChange={(e) => props.onChange(e.target.value)}
          onFocus={props.onFocus}
          onBlur={props.onBlur}
          data-testid="sql-input"
        />
      </div>
    );
  };
});

describe('SQLEditor E2E Tests', () => {
  const testSchema: SchemaDefinition = {
    databases: {
      testdb: {
        name: 'testdb',
        tables: {
          users: {
            name: 'users',
            columns: {
              id: { type: 'int', primaryKey: true },
              username: { type: 'varchar', length: 50 },
              email: { type: 'varchar', length: 255 },
              status: { type: 'varchar', length: 20 },
            },
          },
          orders: {
            name: 'orders',
            columns: {
              id: { type: 'int', primaryKey: true },
              user_id: { type: 'int' },
              total: { type: 'decimal' },
            },
          },
        },
      },
    },
  };

  describe('Basic Rendering', () => {
    it('should render without crashing', () => {
      render(
        <SQLEditor
          value="SELECT * FROM users"
          onChange={() => {}}
        />
      );

      expect(screen.getByTestId('ace-editor')).toBeInTheDocument();
    });

    it('should display initial SQL value', () => {
      const sql = 'SELECT * FROM users';
      render(
        <SQLEditor
          value={sql}
          onChange={() => {}}
        />
      );

      const input = screen.getByTestId('sql-input');
      expect(input).toHaveValue(sql);
    });

    it('should call onChange when SQL changes', () => {
      const handleChange = jest.fn();
      render(
        <SQLEditor
          value=""
          onChange={handleChange}
        />
      );

      const input = screen.getByTestId('sql-input');
      fireEvent.change(input, { target: { value: 'SELECT * FROM users' } });

      expect(handleChange).toHaveBeenCalled();
    });
  });

  describe('Schema Integration', () => {
    it('should accept schema prop', () => {
      render(
        <SQLEditor
          value="SELECT * FROM users"
          onChange={() => {}}
          schema={testSchema}
        />
      );

      expect(screen.getByTestId('ace-editor')).toBeInTheDocument();
    });

    it('should work without schema', () => {
      render(
        <SQLEditor
          value="SELECT * FROM users"
          onChange={() => {}}
        />
      );

      expect(screen.getByTestId('ace-editor')).toBeInTheDocument();
    });
  });

  describe('Autocomplete Configuration', () => {
    it('should accept autocomplete options', () => {
      render(
        <SQLEditor
          value="SELECT * FROM users"
          onChange={() => {}}
          schema={testSchema}
          autocomplete={{
            enabled: true,
            fuzzyMatch: true,
            maxSuggestions: 10,
          }}
        />
      );

      expect(screen.getByTestId('ace-editor')).toBeInTheDocument();
    });

    it('should work with autocomplete disabled', () => {
      render(
        <SQLEditor
          value="SELECT * FROM users"
          onChange={() => {}}
          schema={testSchema}
          autocomplete={{
            enabled: false,
          }}
        />
      );

      expect(screen.getByTestId('ace-editor')).toBeInTheDocument();
    });
  });

  describe('Validation Configuration', () => {
    it('should accept validation options', () => {
      render(
        <SQLEditor
          value="SELECT * FROM users"
          onChange={() => {}}
          schema={testSchema}
          validation={{
            enabled: true,
            validateOnChange: true,
            debounceMs: 300,
          }}
        />
      );

      expect(screen.getByTestId('ace-editor')).toBeInTheDocument();
    });

    it('should work with validation disabled', () => {
      render(
        <SQLEditor
          value="SELECT * FROM users"
          onChange={() => {}}
          schema={testSchema}
          validation={{
            enabled: false,
          }}
        />
      );

      expect(screen.getByTestId('ace-editor')).toBeInTheDocument();
    });
  });

  describe('Dialect Support', () => {
    it('should accept MySQL dialect', () => {
      render(
        <SQLEditor
          value="SELECT * FROM users"
          onChange={() => {}}
          dialect="mysql"
        />
      );

      expect(screen.getByTestId('ace-editor')).toBeInTheDocument();
    });

    it('should accept PostgreSQL dialect', () => {
      render(
        <SQLEditor
          value="SELECT * FROM users"
          onChange={() => {}}
          dialect="postgresql"
        />
      );

      expect(screen.getByTestId('ace-editor')).toBeInTheDocument();
    });

    it('should accept all supported dialects', () => {
      const dialects = ['mysql', 'postgresql', 'flink', 'spark', 'hive', 'trino', 'impala'] as const;

      dialects.forEach((dialect) => {
        const { unmount } = render(
          <SQLEditor
            value="SELECT * FROM users"
            onChange={() => {}}
            dialect={dialect}
          />
        );

        expect(screen.getByTestId('ace-editor')).toBeInTheDocument();
        unmount();
      });
    });
  });

  describe('Editor Options', () => {
    it('should accept height and width', () => {
      render(
        <SQLEditor
          value="SELECT * FROM users"
          onChange={() => {}}
          height="600px"
          width="100%"
        />
      );

      expect(screen.getByTestId('ace-editor')).toBeInTheDocument();
    });

    it('should accept theme', () => {
      render(
        <SQLEditor
          value="SELECT * FROM users"
          onChange={() => {}}
          theme="github"
        />
      );

      expect(screen.getByTestId('ace-editor')).toBeInTheDocument();
    });

    it('should accept fontSize and tabSize', () => {
      render(
        <SQLEditor
          value="SELECT * FROM users"
          onChange={() => {}}
          fontSize={16}
          tabSize={4}
        />
      );

      expect(screen.getByTestId('ace-editor')).toBeInTheDocument();
    });

    it('should accept readOnly mode', () => {
      render(
        <SQLEditor
          value="SELECT * FROM users"
          onChange={() => {}}
          readOnly={true}
        />
      );

      expect(screen.getByTestId('ace-editor')).toBeInTheDocument();
    });
  });

  describe('Event Handlers', () => {
    it('should call onFocus when editor is focused', () => {
      const handleFocus = jest.fn();
      render(
        <SQLEditor
          value="SELECT * FROM users"
          onChange={() => {}}
          onFocus={handleFocus}
        />
      );

      const input = screen.getByTestId('sql-input');
      fireEvent.focus(input);

      expect(handleFocus).toHaveBeenCalled();
    });

    it('should call onBlur when editor loses focus', () => {
      const handleBlur = jest.fn();
      render(
        <SQLEditor
          value="SELECT * FROM users"
          onChange={() => {}}
          onBlur={handleBlur}
        />
      );

      const input = screen.getByTestId('sql-input');
      fireEvent.blur(input);

      expect(handleBlur).toHaveBeenCalled();
    });
  });

  describe('Value Sync', () => {
    it('should sync external value changes', () => {
      const { rerender } = render(
        <SQLEditor
          value="SELECT * FROM users"
          onChange={() => {}}
        />
      );

      let input = screen.getByTestId('sql-input');
      expect(input).toHaveValue('SELECT * FROM users');

      rerender(
        <SQLEditor
          value="SELECT * FROM orders"
          onChange={() => {}}
        />
      );

      input = screen.getByTestId('sql-input');
      expect(input).toHaveValue('SELECT * FROM orders');
    });
  });

  describe('Parser Options', () => {
    it('should accept parser options with embedded variables', () => {
      render(
        <SQLEditor
          value="SELECT * FROM $(table)"
          onChange={() => {}}
          parserOptions={{
            embeddedVariables: true,
          }}
        />
      );

      expect(screen.getByTestId('ace-editor')).toBeInTheDocument();
    });
  });

  describe('Custom Providers and Validators', () => {
    it('should accept custom completion providers', () => {
      const customProvider = {
        canProvide: () => true,
        provide: () => [
          { label: 'CUSTOM', type: 'custom' as const, sortPriority: 1 },
        ],
      };

      render(
        <SQLEditor
          value="SELECT * FROM users"
          onChange={() => {}}
          completionProviders={[customProvider]}
        />
      );

      expect(screen.getByTestId('ace-editor')).toBeInTheDocument();
    });

    it('should accept custom validators', () => {
      const customValidator = {
        name: 'custom',
        validate: () => [],
      };

      render(
        <SQLEditor
          value="SELECT * FROM users"
          onChange={() => {}}
          validators={[customValidator]}
        />
      );

      expect(screen.getByTestId('ace-editor')).toBeInTheDocument();
    });
  });
});

