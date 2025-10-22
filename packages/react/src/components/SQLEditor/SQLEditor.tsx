/**
 * SQL Editor Component
 * @packageDocumentation
 */

import React, { useRef, useCallback, useEffect, useState } from 'react';
import AceEditor from 'react-ace';
import 'ace-builds/src-noconflict/mode-sql';
import 'ace-builds/src-noconflict/theme-monokai';
import 'ace-builds/src-noconflict/ext-language_tools';

import { useSQLEditor } from '../../hooks/useSQLEditor';
import { useAutocomplete } from '../../hooks/useAutocomplete';
import { CompletionPopup } from '../CompletionPopup';
import type { SQLEditorProps } from '../../types/props';
import type { Completion } from '@sql-editor/core';

/**
 * SQL Editor Component
 *
 * A feature-rich SQL editor with intelligent autocomplete, validation, and syntax highlighting.
 *
 * @example
 * ```tsx
 * <SQLEditor
 *   value={sql}
 *   onChange={setSql}
 *   schema={schema}
 *   dialect="mysql"
 *   height="400px"
 * />
 * ```
 */
export const SQLEditor: React.FC<SQLEditorProps> = ({
  value,
  onChange,
  schema,
  dialect: _dialect = 'mysql',
  height = '400px',
  width = '100%',
  theme = 'monokai',
  autocomplete: autocompleteOptions,
  validation: validationOptions,
  completionProviders,
  validators,
  parserOptions,
  readOnly = false,
  showLineNumbers = true,
  fontSize = 14,
  tabSize = 2,
  enableCodeFolding = true,
  className = '',
  placeholder,
  onBlur,
  onFocus,
}) => {
  const editorRef = useRef<any>(null);
  const [cursorPosition, setCursorPosition] = useState({ row: 0, column: 0 });
  const [popupPosition, setPopupPosition] = useState({ top: 0, left: 0 });
  const triggerAutocompleteRef = useRef<(() => void) | null>(null);

  // Use SQL Editor hook
  const { value: internalValue, onChange: handleInternalChange, schema: schemaRegistry, autocomplete: autocompleteEngine, errors } = useSQLEditor({
    initialValue: value,
    ...(schema && { schema }),
    ...(autocompleteOptions && { autocompleteOptions }),
    ...(validationOptions && { validationOptions }),
    ...(completionProviders && { completionProviders }),
    ...(validators && { validators }),
    ...(parserOptions && { parserOptions }),
  });

  // Sync internal value with prop
  useEffect(() => {
    if (value !== internalValue) {
      handleInternalChange(value);
    }
  }, [value]);

  // Use autocomplete hook
  const {
    suggestions,
    getSuggestions,
    selectedIndex,
    selectSuggestion,
    visible: popupVisible,
    show: showPopup,
    hide: hidePopup,
  } = useAutocomplete({
    engine: autocompleteEngine,
    schema: schemaRegistry,
  });

  // Handle cursor position change
  const handleCursorChange = useCallback(
    (selection: any) => {
      const { row, column } = selection.getCursor();
      setCursorPosition({ row, column });

      // Update popup position
      if (editorRef.current) {
        const editor = editorRef.current.editor;
        const renderer = editor.renderer;
        const pos = renderer.textToScreenCoordinates(row, column);
        const lineHeight = renderer.lineHeight;
        
        setPopupPosition({
          top: pos.pageY + lineHeight,
          left: pos.pageX,
        });

        // Auto-trigger autocomplete if after a dot
        if (autocompleteOptions?.enabled !== false) {
          const session = editor.getSession();
          const line = session.getLine(row);
          const charBefore = line.charAt(column - 1);
          
          if (charBefore === '.' && triggerAutocompleteRef.current) {
            setTimeout(() => triggerAutocompleteRef.current?.(), 100);
          }
        }
      }
    },
    [autocompleteOptions]
  );

  // Trigger autocomplete
  const triggerAutocomplete = useCallback(() => {
    if (!autocompleteOptions?.enabled && autocompleteOptions?.enabled !== undefined) {
      return;
    }

    const completions = getSuggestions(
      internalValue,
      cursorPosition.row,
      cursorPosition.column
    );

    if (completions.length > 0) {
      showPopup();
    } else {
      hidePopup();
    }
  }, [internalValue, cursorPosition, getSuggestions, showPopup, hidePopup, autocompleteOptions]);

  // Store triggerAutocomplete in ref for use in other callbacks
  useEffect(() => {
    triggerAutocompleteRef.current = triggerAutocomplete;
  }, [triggerAutocomplete]);

  // Handle value change
  const handleChange = useCallback(
    (newValue: string) => {
      handleInternalChange(newValue);
      onChange(newValue);
      
      // Auto-trigger autocomplete on dot
      const lastChar = newValue.charAt(newValue.length - 1);
      if (lastChar === '.') {
        // Small delay to let cursor position update
        setTimeout(() => triggerAutocomplete(), 50);
      }
    },
    [onChange, handleInternalChange, triggerAutocomplete]
  );

  // Insert completion
  const insertCompletion = useCallback(
    (completion: Completion) => {
      if (!editorRef.current) return;

      const editor = editorRef.current.editor;
      const session = editor.getSession();
      const { row, column } = cursorPosition;

      // Get current line and token
      const line = session.getLine(row);
      const tokenStart = line.substring(0, column).match(/[\w]*$/)?.[0] || '';

      // Calculate range to replace
      const start = column - tokenStart.length;
      const end = column;

      // Insert text
      const textToInsert = completion.insertText || completion.label;
      session.replace(
        {
          start: { row, column: start },
          end: { row, column: end },
        },
        textToInsert
      );

      // Move cursor to end of inserted text
      editor.moveCursorTo(row, start + textToInsert.length);
      editor.focus();

      hidePopup();
    },
    [cursorPosition, hidePopup]
  );

  // Handle completion selection
  const handleCompletionSelect = useCallback(
    (index: number) => {
      selectSuggestion(index);
      const completion = suggestions[index];
      if (completion) {
        insertCompletion(completion);
      }
    },
    [suggestions, selectSuggestion, insertCompletion]
  );

  // Set validation markers
  useEffect(() => {
    if (!editorRef.current) return;

    const editor = editorRef.current.editor;
    const session = editor.getSession();

    if (!errors || errors.length === 0) {
      // Clear annotations when there are no errors
      session.clearAnnotations();
      return;
    }

    const annotations = errors.map((error) => ({
      row: error.location?.start.line || 0,
      column: error.location?.start.column || 0,
      text: error.message,
      type: error.severity,
    }));

    session.setAnnotations(annotations);
  }, [errors]);

  return (
    <div className={`sql-editor-container ${className}`} style={{ position: 'relative' }}>
      <AceEditor
        ref={editorRef}
        mode="sql"
        theme={theme}
        value={internalValue}
        onChange={handleChange}
        onCursorChange={handleCursorChange}
        name="sql-editor"
        width={width}
        height={height}
        fontSize={fontSize}
        showPrintMargin={false}
        showGutter={showLineNumbers}
        highlightActiveLine={!readOnly}
        readOnly={readOnly}
        tabSize={tabSize}
        onBlur={onBlur}
        onFocus={onFocus}
        setOptions={{
          enableBasicAutocompletion: false, // We handle autocomplete ourselves
          enableLiveAutocompletion: false,
          enableSnippets: false,
          showLineNumbers: showLineNumbers,
          tabSize: tabSize,
          useWorker: false,
          ...(enableCodeFolding && { foldStyle: 'markbegin' as any }),
        }}
        placeholder={placeholder}
        commands={[
          {
            name: 'triggerAutocomplete',
            bindKey: { win: 'Ctrl-Space', mac: 'Cmd-Space' },
            exec: () => triggerAutocomplete(),
          },
        ]}
      />

      <CompletionPopup
        items={suggestions}
        selectedIndex={selectedIndex}
        position={popupPosition}
        onSelect={handleCompletionSelect}
        onClose={hidePopup}
        visible={popupVisible}
      />
    </div>
  );
};

