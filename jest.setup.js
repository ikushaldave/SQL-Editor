// Add custom jest matchers from jest-dom
require('@testing-library/jest-dom');

// Mock Ace Editor
jest.mock('react-ace', () => {
  return {
    __esModule: true,
    default: jest.fn(() => null),
  };
});

// Suppress console errors in tests (optional)
global.console = {
  ...console,
  error: jest.fn(),
  warn: jest.fn(),
};

