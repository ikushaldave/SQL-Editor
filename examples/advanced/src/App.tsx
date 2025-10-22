/**
 * Advanced SQL Editor Example
 * Demonstrates all features including variables, validation rules, and custom providers
 */

import React, { useState } from 'react';
import { SQLEditor } from '@sql-editor/react';
import {
  SchemaValidationRule,
  PerformanceValidationRule,
  NamingConventionRule,
  type ValidationRuleConfig,
  type CompletionProvider,
  type SQLContext,
  type SchemaRegistry,
  type Completion,
} from '@sql-editor/core';
import { sampleSchema } from './data/advanced-schema';
import './styles/App.css';

// Custom completion provider for business logic
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
        sortPriority: 1,
        metadata: { category: 'business' },
      },
      {
        label: 'IS_ACTIVE',
        type: 'custom',
        detail: 'Active status check',
        documentation: 'Checks if a record is active',
        sortPriority: 1,
        metadata: { category: 'business' },
      },
    ];
  }
}

const initialSQL = `-- Advanced SQL Editor Demo
-- Features: Variables, Validation Rules, Custom Providers

-- Example with embedded variables
SELECT 
  u.username,
  u.email,
  COUNT(o.id) as order_count,
  SUM(o.total) as total_spent
FROM users u
LEFT JOIN orders o ON u.id = o.user_id
WHERE u.created_at >= DATE_SUB(NOW(), INTERVAL $(days) DAY)
  AND u.status = '$(status)'
GROUP BY u.id, u.username, u.email
HAVING order_count > 0
ORDER BY total_spent DESC
LIMIT $(limit);

-- Try typing "SELECT " to see custom business logic suggestions
-- Try typing "FROM " to see table suggestions
-- Try typing "u." to see column suggestions with alias support
-- Press Ctrl+Space (Cmd+Space on Mac) to trigger autocomplete
`;

function App() {
  const [sql, setSql] = useState(initialSQL);
  const [output, setOutput] = useState('');
  const [showValidationRules, setShowValidationRules] = useState(true);

  // Custom validation rules
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
    {
      rule: new NamingConventionRule(),
      type: 'warning',
      enabled: true,
    },
  ];

  // Custom completion providers
  const completionProviders: CompletionProvider[] = [
    new BusinessLogicProvider(),
  ];

  const handleExecute = () => {
    setOutput(`Executing SQL with variables:\n${sql}\n\n(Demo mode - no actual execution)`);
  };

  const handleFormat = () => {
    // Basic formatting
    const formatted = sql
      .split('\n')
      .map(line => line.trim())
      .join('\n');
    setSql(formatted);
  };

  const handleClear = () => {
    setSql('');
    setOutput('');
  };

  const handleToggleValidationRules = () => {
    setShowValidationRules(!showValidationRules);
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>🚀 SQL Editor - Advanced Example</h1>
        <p>
          Advanced SQL editor with variables, validation rules, and custom providers
        </p>
      </header>

      <main className="app-main">
        <div className="editor-section">
          <div className="toolbar">
            <button onClick={handleExecute} className="btn btn-primary">
              ▶️ Execute
            </button>
            <button onClick={handleFormat} className="btn btn-secondary">
              📝 Format
            </button>
            <button onClick={handleClear} className="btn btn-secondary">
              🗑️ Clear
            </button>
            <button 
              onClick={handleToggleValidationRules} 
              className={`btn ${showValidationRules ? 'btn-success' : 'btn-secondary'}`}
            >
              {showValidationRules ? '✅' : '❌'} Validation Rules
            </button>
          </div>

          <div className="editor-container">
            <SQLEditor
              value={sql}
              onChange={setSql}
              schema={sampleSchema}
              dialect="mysql"
              height="500px"
              theme="monokai"
              fontSize={14}
              tabSize={2}
              showLineNumbers={true}
              enableCodeFolding={true}
              autocomplete={{
                enabled: true,
                fuzzyMatch: true,
                maxSuggestions: 50,
                triggerCharacters: ['.', ' ', '$'],
              }}
              validation={{
                enabled: true,
                validateOnChange: true,
                debounceMs: 300,
              }}
              completionProviders={completionProviders}
              validators={showValidationRules ? validationRules.map(r => r.rule) : []}
            />
          </div>
        </div>

        {output && (
          <div className="output-section">
            <h3>Output</h3>
            <pre className="output">{output}</pre>
          </div>
        )}

        <div className="info-section">
          <h3>Advanced Features</h3>
          <div className="features-grid">
            <div className="feature-card">
              <h4>🔧 Variable Support</h4>
              <p>Embedded variables like <code>$(variable)</code> with position mapping and error handling</p>
              <ul>
                <li>Automatic escaping for parser compatibility</li>
                <li>Position mapping for accurate error reporting</li>
                <li>Variable extraction and validation</li>
              </ul>
            </div>

            <div className="feature-card">
              <h4>✅ Advanced Validation</h4>
              <p>Comprehensive validation rules system with custom rules</p>
              <ul>
                <li>Schema validation (tables, columns)</li>
                <li>Performance validation (LIMIT, WHERE clauses)</li>
                <li>Naming convention validation</li>
                <li>Custom rule support</li>
              </ul>
            </div>

            <div className="feature-card">
              <h4>🎯 Context-Aware Completions</h4>
              <p>Intelligent suggestions based on SQL context and schema</p>
              <ul>
                <li>Table suggestions in FROM clauses</li>
                <li>Column suggestions with alias support</li>
                <li>Context-specific keywords</li>
                <li>Custom completion providers</li>
              </ul>
            </div>

            <div className="feature-card">
              <h4>🔌 Plugin Architecture</h4>
              <p>Extensible system for custom functionality</p>
              <ul>
                <li>Custom completion providers</li>
                <li>Custom validation rules</li>
                <li>Plugin lifecycle management</li>
                <li>Type-safe APIs</li>
              </ul>
            </div>
          </div>

          <h3>Try These Examples</h3>
          <div className="examples">
            <button 
              onClick={() => setSql('SELECT $(columns) FROM $(table) WHERE $(condition)')}
              className="example-btn"
            >
              Variable Example
            </button>
            <button 
              onClick={() => setSql('SELECT u. FROM users u')}
              className="example-btn"
            >
              Alias Completion
            </button>
            <button 
              onClick={() => setSql('SELECT * FROM users')}
              className="example-btn"
            >
              Performance Warning
            </button>
            <button 
              onClick={() => setSql('SELECT CURRENT_USER, IS_ACTIVE FROM users')}
              className="example-btn"
            >
              Custom Providers
            </button>
          </div>
        </div>
      </main>

      <footer className="app-footer">
        <p>
          Built with <code>@sql-editor/react</code> and <code>@sql-editor/core</code>
        </p>
      </footer>
    </div>
  );
}

export default App;
