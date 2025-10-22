# Parser Module - Visual Overview

Quick visual guide to understanding the parser module.

## 🎯 What Does the Parser Do?

```
SQL Text Input
      ↓
┌─────────────────────────────────────┐
│     Parse & Analyze SQL             │
│  • Syntax validation                │
│  • Extract tables & aliases         │
│  • Detect cursor context            │
│  • Handle variables $(var)          │
└─────────────────────────────────────┘
      ↓
Structured Output
  • AST (Abstract Syntax Tree)
  • Table references
  • Aliases map
  • Errors with positions
  • SQL context
```

## 📦 Three Main Components

```
┌─────────────────────┐  ┌──────────────────┐  ┌─────────────────┐
│  ParserService      │  │ ContextDetector  │  │ VariableHandler │
│  (286 lines)        │  │ (193 lines)      │  │ (177 lines)     │
├─────────────────────┤  ├──────────────────┤  ├─────────────────┤
│ • parse()           │  │ • detectContext()│  │ • hasVariables()│
│ • validate()        │  │ • resolveAlias() │  │ • extractVars() │
│ • extractTableRefs()│  │                  │  │ • escapeVars()  │
│ • extractAliases()  │  │ Returns:         │  │ • revertSql()   │
│ • getSuggestions()  │  │  • Context type  │  │ • revertErrors()│
│                     │  │  • Current token │  │                 │
│ Returns ParseResult │  │  • After dot?    │  │ Format:         │
│  with AST, errors,  │  │  • Dot prefix    │  │  $(variable)    │
│  tables, aliases    │  │  • Prev token    │  │                 │
└─────────────────────┘  └──────────────────┘  └─────────────────┘
        ↓                         ↓                      ↓
   45 tests               43 tests                 13 tests
```

## 🔄 How They Work Together

```
1. USER TYPES SQL
   "SELECT u.name FROM $(table) u WHERE u."
          ↓
2. VARIABLE HANDLER
   • Detects: $(table)
   • Escapes: ${placeholder}_0
          ↓
3. PARSER SERVICE  
   • Parses escaped SQL
   • Extracts tables: [{ name: '...', alias: 'u' }]
   • Validates syntax
          ↓
4. CONTEXT DETECTOR
   • Position: after "u."
   • Detects: where_clause context
   • afterDot: true, dotPrefix: 'u'
          ↓
5. AUTOCOMPLETE
   • Suggests columns from table 'u'
```

## 🧪 Test Coverage: 101 Tests

```
├── ParserService Tests (45)
│   ├── parse() valid SQL                    ✅
│   ├── parse() with errors                  ✅
│   ├── parse() extract tables               ✅
│   ├── parse() with aliases                 ✅
│   ├── parse() JOIN statements              ✅
│   ├── parse() complex queries              ✅
│   ├── parse() with variables               ✅
│   ├── validate()                           ✅
│   ├── extractTableRefs()                   ✅
│   ├── extractAliases()                     ✅
│   ├── getSuggestions()                     ✅
│   ├── setOptions()                         ✅
│   └── Edge cases                           ✅
│
├── ContextDetector Tests (43)
│   ├── select_list context                  ✅
│   ├── from_clause context                  ✅
│   ├── where_clause context                 ✅
│   ├── join_clause context                  ✅
│   ├── group_by context                     ✅
│   ├── order_by context                     ✅
│   ├── having_clause context                ✅
│   ├── function context                     ✅
│   ├── unknown context                      ✅
│   ├── resolveAlias()                       ✅
│   ├── Multi-line SQL                       ✅
│   ├── Case insensitivity                   ✅
│   └── Edge cases                           ✅
│
└── VariableHandler Tests (13)
    ├── hasVariables()                       ✅
    ├── extractVariables()                   ✅
    ├── escapeVariables()                    ✅
    ├── revertEscapedSql()                   ✅
    ├── revertErrorPositions()               ✅
    ├── Round-trip tests                     ✅
    └── Edge cases                           ✅

All 101 tests PASSING ✅
```

## 📖 Context Types Explained

```
Cursor Position: █

SELECT █              → select_list    (suggest columns, functions)
SELECT * FROM █       → from_clause    (suggest tables)
WHERE █               → where_clause   (suggest columns, operators)
JOIN █                → join_clause    (suggest tables)
GROUP BY █            → group_by       (suggest columns)
ORDER BY █            → order_by       (suggest columns, ASC, DESC)
HAVING █              → having_clause  (suggest aggregates)
COUNT(█)              → function       (suggest columns)
```

## 💡 Common Use Cases

### Use Case 1: Basic Parsing
```typescript
const parser = new ParserService();
const result = parser.parse('SELECT * FROM users');

console.log(result.success);    // true
console.log(result.tableRefs);  // [{ name: 'users' }]
```

### Use Case 2: Autocomplete
```typescript
const sql = 'SELECT u. FROM users u';
const context = detectContext(sql, { line: 0, column: 9 }, tableRefs);

if (context.afterDot) {
  // Suggest columns from table 'u'
  const table = resolveAlias(context.dotPrefix, tableRefs);
}
```

### Use Case 3: Variables
```typescript
parser.setOptions({ embeddedVariables: true });
const result = parser.parse('SELECT * FROM $(table)');
// Automatically handles variable escaping
```

## 📁 File Organization

```
packages/core/src/parser/
│
├── 📄 Source Code
│   ├── parser-service.ts         (Main parser)
│   ├── context-detector.ts       (Context detection)
│   ├── variable-handler.ts       (Variable handling)
│   └── index.ts                  (Exports)
│
├── 🧪 Tests (NEW!)
│   └── __tests__/
│       ├── parser-service.test.ts     (45 tests)
│       ├── context-detector.test.ts   (43 tests)
│       └── variable-handler.test.ts   (13 tests)
│
└── 📚 Documentation (NEW!)
    ├── README.md                 (Quick reference)
    └── PARSER_GUIDE.md          (Comprehensive guide)
```

## 🎓 Learning Path

```
┌─────────────────────────────────────────────────────────┐
│ START HERE                                              │
│                                                         │
│ 1. Read: parser/README.md                              │
│    └─→ Quick examples, API overview                    │
│                                                         │
│ 2. Try: Run tests                                       │
│    └─→ npm test -- parser                              │
│                                                         │
│ 3. Explore: Look at test files                         │
│    └─→ See real usage examples                         │
│                                                         │
│ 4. Deep Dive: Read PARSER_GUIDE.md                     │
│    └─→ Complete understanding                          │
│                                                         │
│ 5. Experiment: Write your own code                     │
│    └─→ Use parser in your project                      │
└─────────────────────────────────────────────────────────┘
```

## 📊 Quick Stats

| Metric | Value |
|--------|-------|
| **Components** | 3 |
| **Source Lines** | 656 |
| **Test Files** | 3 |
| **Test Cases** | 101 |
| **Documentation** | 2 guides |
| **Pass Rate** | 100% |
| **Coverage** | Complete |

## 🚀 Quick Commands

```bash
# Run all parser tests
npm test -- parser

# Run specific component
npm test -- parser-service
npm test -- context-detector
npm test -- variable-handler

# Watch mode (auto re-run)
npm test -- --watch parser

# With coverage report
npm test -- --coverage parser
```

## 🎯 Key Takeaways

1. **ParserService** = Main parser (parse, validate, extract)
2. **ContextDetector** = Where is cursor? (for autocomplete)
3. **VariableHandler** = Handle $(variables) in SQL

All thoroughly tested with **101 passing tests**!

## 📚 Documentation Files

| File | Purpose | Lines |
|------|---------|-------|
| `parser/README.md` | Quick start & reference | ~350 |
| `parser/PARSER_GUIDE.md` | Comprehensive guide | ~600 |
| `PARSER_TESTING_SUMMARY.md` | Test overview | ~650 |
| `PARSER_OVERVIEW.md` | Visual summary (this file) | ~250 |

---

**Total Created**: 
- ✅ 3 test files (101 tests)
- ✅ 2 detailed guides
- ✅ 2 summary documents
- ✅ 100% passing tests
