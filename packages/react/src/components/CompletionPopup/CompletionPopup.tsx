/**
 * Completion Popup Component
 * @packageDocumentation
 */

import React, { useEffect, useRef } from 'react';
import type { Completion } from '@sql-editor/core';

/**
 * Completion popup component props
 */
export interface CompletionPopupProps {
  /** Completion items */
  items: Completion[];

  /** Selected index */
  selectedIndex: number;

  /** Position */
  position: {
    top: number;
    left: number;
  };

  /** On select callback */
  onSelect: (index: number) => void;

  /** On close callback */
  onClose: () => void;

  /** Visible */
  visible: boolean;
}

/**
 * Get icon for completion type
 */
function getCompletionIcon(type: string): string {
  switch (type) {
    case 'table':
      return '📋';
    case 'column':
      return '📊';
    case 'keyword':
      return '🔤';
    case 'function':
      return '⚙️';
    case 'database':
      return '🗄️';
    default:
      return '•';
  }
}

/**
 * Completion popup component
 *
 * @example
 * ```tsx
 * <CompletionPopup
 *   items={completions}
 *   selectedIndex={0}
 *   position={{ top: 100, left: 50 }}
 *   onSelect={handleSelect}
 *   onClose={handleClose}
 *   visible={true}
 * />
 * ```
 */
export const CompletionPopup: React.FC<CompletionPopupProps> = ({
  items,
  selectedIndex,
  position,
  onSelect,
  onClose: _onClose,
  visible,
}) => {
  const popupRef = useRef<HTMLDivElement>(null);

  // Scroll selected item into view
  useEffect(() => {
    if (popupRef.current && visible) {
      const selected = popupRef.current.querySelector('.completion-item-selected');
      selected?.scrollIntoView({ block: 'nearest' });
    }
  }, [selectedIndex, visible]);

  if (!visible || items.length === 0) {
    return null;
  }

  return (
    <div
      ref={popupRef}
      className="sql-completion-popup"
      style={{
        position: 'absolute',
        top: position.top,
        left: position.left,
        zIndex: 1000,
      }}
    >
      <div className="completion-list">
        {items.map((item, index) => (
          <div
            key={`${item.label}-${index}`}
            className={`completion-item ${
              index === selectedIndex ? 'completion-item-selected' : ''
            }`}
            onClick={() => onSelect(index)}
            onMouseEnter={() => onSelect(index)}
          >
            <span className="completion-icon">{getCompletionIcon(item.type)}</span>
            <span className="completion-label">{item.label}</span>
            {item.detail && <span className="completion-detail">{item.detail}</span>}
          </div>
        ))}
      </div>
    </div>
  );
};

