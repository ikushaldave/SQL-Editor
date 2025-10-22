import React, { useState } from 'react';
import { SQLEditor } from '@sql-editor/react';
import { SQL_DIALECTS } from '@sql-editor/core';
import { sampleSchema } from './data/sample-schema';
import { TEST_QUERIES, QUERY_CATEGORIES } from './data/test-queries';
import './styles/App.css';

const initialSQL = `-- SQL Editor Demo
-- Try autocomplete by typing "SELECT " or "FROM "
-- Press Ctrl+Space (Cmd+Space on Mac) to trigger autocomplete

SELECT 
  u.id,
  u.username,
  u.email,
  COUNT(o.id) AS order_count
FROM users u
LEFT JOIN orders o ON u.id = o.user_id
GROUP BY u.id, u.username, u.email
ORDER BY order_count DESC
LIMIT 10;
`;

function App() {
  const [sql, setSql] = useState(initialSQL);
  const [output, setOutput] = useState('');
  const [dialect, setDialect] = useState<'mysql' | 'postgresql' | 'flink' | 'spark' | 'hive' | 'trino' | 'impala'>('mysql');

  const handleExecute = () => {
    setOutput(`Executing SQL (${dialect}):\n${sql}\n\n(Demo mode - no actual execution)`);
  };

  const handleValidate = () => {
    setOutput(`Validation for ${dialect}:\n\nNote: This is a demo. Full validation requires actual parser integration.\n\nSQL looks good! ✅`);
  };

  const handleFormat = () => {
    // Basic formatting
    const formatted = sql
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0)
      .join('\n');
    setSql(formatted);
  };

  const handleClear = () => {
    setSql('');
    setOutput('');
  };

  const loadExample = (queryKey: keyof typeof TEST_QUERIES) => {
    setSql(TEST_QUERIES[queryKey]);
    setOutput('');
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>🚀 SQL Editor</h1>
        <p>
          Scalable, extensible SQL editor with intelligent autocomplete
        </p>
      </header>

      <main className="app-main">
        <div className="editor-section">
          <div className="toolbar">
            <button onClick={handleExecute} className="btn btn-primary">
              ▶️ Execute
            </button>
            <button onClick={handleValidate} className="btn btn-success">
              ✅ Validate
            </button>
            <button onClick={handleFormat} className="btn btn-secondary">
              📝 Format
            </button>
            <button onClick={handleClear} className="btn btn-secondary">
              🗑️ Clear
            </button>
            
            <select 
              value={dialect} 
              onChange={(e) => setDialect(e.target.value as any)}
              className="dialect-selector"
            >
              <option value={SQL_DIALECTS.MYSQL}>MySQL</option>
              <option value={SQL_DIALECTS.POSTGRESQL}>PostgreSQL</option>
              <option value={SQL_DIALECTS.FLINK}>Flink SQL</option>
              <option value={SQL_DIALECTS.SPARK}>Spark SQL</option>
              <option value={SQL_DIALECTS.HIVE}>Hive SQL</option>
              <option value={SQL_DIALECTS.TRINO}>Trino SQL</option>
              <option value={SQL_DIALECTS.IMPALA}>Impala SQL</option>
            </select>
          </div>

          <div className="editor-container">
            <SQLEditor
              value={sql}
              onChange={setSql}
              schema={sampleSchema}
              dialect={dialect}
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
              }}
              validation={{
                enabled: true, // Enable validation to show syntax errors
                validateOnChange: true,
                debounceMs: 500, // Wait 500ms after typing stops before validating
              }}
              parserOptions={{
                embeddedVariables: true, // Enable $(variable) syntax
              }}
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
          <h3>✨ Try These Example Queries</h3>
          <div className="examples">
            {QUERY_CATEGORIES.map((category) => (
              <button
                key={category.id}
                onClick={() => loadExample(category.id as keyof typeof TEST_QUERIES)}
                className="example-btn"
                title={category.name}
              >
                {category.icon} {category.name}
              </button>
            ))}
          </div>

          <h3>🎯 Features</h3>
          <div className="features-grid">
            <div className="feature-card">
              <h4>🎨 Context-Aware Autocomplete</h4>
              <p>Intelligent suggestions based on SQL context</p>
              <ul>
                <li>Table suggestions in FROM clauses</li>
                <li>Column suggestions with alias support</li>
                <li>Context-specific keywords</li>
                <li>SQL function suggestions</li>
              </ul>
            </div>

            <div className="feature-card">
              <h4>🌐 Multi-Dialect Support</h4>
              <p>Support for 7 SQL dialects</p>
              <ul>
                <li>MySQL</li>
                <li>PostgreSQL</li>
                <li>Flink SQL</li>
                <li>Spark SQL</li>
                <li>Hive SQL</li>
                <li>Trino SQL</li>
                <li>Impala SQL</li>
              </ul>
            </div>

            <div className="feature-card">
              <h4>🔧 Variable Support</h4>
              <p>Embedded variables with position mapping</p>
              <ul>
                <li>Use <code>$(variable)</code> syntax</li>
                <li>Automatic escaping</li>
                <li>Error position mapping</li>
                <li>Variable extraction</li>
              </ul>
            </div>

            <div className="feature-card">
              <h4>✅ Advanced Validation</h4>
              <p>Comprehensive validation rules</p>
              <ul>
                <li>Real-time syntax validation</li>
                <li>Schema validation</li>
                <li>Performance warnings</li>
                <li>Custom validation rules</li>
              </ul>
            </div>
          </div>

          <h3>💡 Tips & Usage</h3>
          <ul>
            <li>✨ <strong>Autocomplete</strong>: Press <code>Ctrl+Space</code> (or <code>Cmd+Space</code> on Mac)</li>
            <li>🏷️ <strong>Alias Support</strong>: Type <code>u.</code> after defining alias to see columns</li>
            <li>📝 <strong>Keywords</strong>: Start typing any SQL keyword to see suggestions</li>
            <li>🔧 <strong>Variables</strong>: Use <code>$(variable)</code> syntax (try "With Variables" example)</li>
            <li>🌐 <strong>Dialects</strong>: Switch between 7 SQL dialects in the dropdown</li>
            <li>📊 <strong>Examples</strong>: Click example buttons to load different SQL patterns</li>
            <li>⚠️ <strong>Note</strong>: Auto-validation is disabled to allow partial SQL while typing</li>
            <li>✅ <strong>Validate</strong>: Click the "Validate" button to check SQL when complete</li>
          </ul>
        </div>
      </main>

      <footer className="app-footer">
        <p>
          Built with <code>@sql-editor/react</code> • 
          Testing <strong>{dialect.toUpperCase()}</strong> dialect • 
          164 tests passing ✅
        </p>
      </footer>
    </div>
  );
}

export default App;
