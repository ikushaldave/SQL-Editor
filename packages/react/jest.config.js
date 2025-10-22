module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  roots: ['<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.test.{ts,tsx}'],
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/__tests__/**',
    '!src/**/__mocks__/**',
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  transform: {
    '^.+\\.tsx?$': ['ts-jest', {
      tsconfig: {
        jsx: 'react-jsx',
      },
    }],
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  moduleNameMapper: {
    '^@sql-editor/core$': '<rootDir>/../core/src/index.ts',
    '^dt-sql-parser$': '<rootDir>/../core/src/__mocks__/dt-sql-parser.ts',
    '\\.css$': '<rootDir>/src/__mocks__/styleMock.js',
    '^ace-builds/(.*)$': '<rootDir>/src/__mocks__/ace-builds.js',
  },
  setupFilesAfterEnv: ['<rootDir>/src/__tests__/setup.ts'],
  transformIgnorePatterns: [
    'node_modules/(?!(dt-sql-parser)/)',
  ],
};
