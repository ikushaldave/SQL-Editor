/**
 * Mock for dt-sql-parser
 */

export class MySQL {
  parse(input: string): any {
    // Mock parse - return a simple AST
    return {
      type: 'program',
      statements: [
        {
          type: 'select',
          columns: ['*'],
          from: 'users',
        },
      ],
    };
  }

  validate(input: string): any[] {
    // Return a mock error for incomplete SQL
    if (input.includes('SELECT') && !input.includes('FROM')) {
      return [
        {
          message: 'Syntax error: missing FROM clause',
          startLine: 1,
          startColumn: 1,
          endLine: 1,
          endColumn: 10,
        },
      ];
    }
    
    // Return empty for valid SQL
    return [];
  }
}

export class FlinkSQL extends MySQL {}
export class SparkSQL extends MySQL {}
export class HiveSQL extends MySQL {}
export class PostgreSQL extends MySQL {}
export class TrinoSQL extends MySQL {}
export class ImpalaSQL extends MySQL {}
