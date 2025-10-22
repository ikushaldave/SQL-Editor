/**
 * Basic SQL Editor Example
 */

import React, { useState } from 'react';
import { SQLEditor } from '@sql-editor/react';
import { sampleSchema } from './data/sample-schema';
import './styles/App.css';

const initialSQL = `-- Welcome to SQL Editor!
-- Try typing queries below and experience intelligent autocomplete

SELECT 
  u.username,
  u.email,
  COUNT(o.id) as order_count,
  SUM(o.total) as total_spent
FROM users u
LEFT JOIN orders o ON u.id = o.user_id
WHERE u.created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
GROUP BY u.id, u.username, u.email
HAVING order_count > 0
ORDER BY total_spent DESC
LIMIT 10;

-- Try typing "SELECT u." to see column suggestions
-- Try typing "FROM " to see table suggestions
-- Press Ctrl+Space (Cmd+Space on Mac) to trigger autocomplete
`;

function App() {
  const [sql, setSql] = useState(initialSQL);
  const [output, setOutput] = useState('');

  const handleExecute = () => {
    setOutput(`Executing SQL:\n${sql}\n\n(Demo mode - no actual execution)`);
  };

  const handleFormat = () => {
    // Basic formatting example
    const formatted = sql
      .split('\n')
      .map(line => line.trim())
      .join('\n');
    setSql(formatted);
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>🗄️ SQL Editor - Basic Example</h1>
        <p>
          Intelligent SQL editor with autocomplete, validation, and syntax highlighting
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
            <button onClick={() => setSql('')} className="btn btn-secondary">
              🗑️ Clear
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
              }}
              validation={{
                enabled: true,
                validateOnChange: true,
                debounceMs: 300,
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
          <h3>Features</h3>
          <ul>
            <li>✨ <strong>Intelligent Autocomplete:</strong> Context-aware suggestions for tables, columns, keywords, and functions</li>
            <li>🎯 <strong>Alias Support:</strong> Full support for table aliases (e.g., <code>SELECT u.name FROM users u</code>)</li>
            <li>✅ <strong>Real-time Validation:</strong> Syntax and semantic validation as you type</li>
            <li>🎨 <strong>Syntax Highlighting:</strong> Beautiful SQL syntax highlighting</li>
            <li>⌨️ <strong>Keyboard Shortcuts:</strong> Ctrl/Cmd+Space for autocomplete, Tab/Enter to accept</li>
            <li>📊 <strong>Schema Awareness:</strong> Knows your database schema and suggests relevant items</li>
          </ul>

          <h3>Try These Examples</h3>
          <div className="examples">
            <button 
              onClick={() => setSql('SELECT u. FROM users u')}
              className="example-btn"
            >
              Alias Completion
            </button>
            <button 
              onClick={() => setSql('SELECT * FROM ')}
              className="example-btn"
            >
              Table Suggestions
            </button>
            <button 
              onClick={() => setSql('SELECT COUNT() FROM orders')}
              className="example-btn"
            >
              Function Completion
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

