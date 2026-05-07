---
name: js-primitive-type-checker
description: >
  Runtime primitive type checker library for JavaScript/TypeScript. Tracks and enforces typeof-based
  types (number, string, boolean, object, array, function, symbol, bigint) on object properties,
  function arguments, and return values. Use when adding runtime type safety to JavaScript objects,
  integrating with the @actualwave/type-checkers framework, configuring per-property reporting
  levels, or replacing/extending the error reporter.
license: MIT
metadata:
  author: Oleg Galaburda
  package: "@actualwave/primitive-type-checker"
  version: "0.2.2"
---

## Overview

`@actualwave/primitive-type-checker` is a TypeScript library that enforces primitive types at
runtime. It works as a plugin for the `@actualwave/type-checkers` proxy-based wrapping system:
once a property's type is observed, subsequent assignments of a different type trigger the error
reporter.

Arrays are distinguished from plain objects — `typeof [] === 'object'` is `false` here; arrays
report as `'array'`.

## Installation

```bash
npm install @actualwave/primitive-type-checker
```

## Key exports

| Export | Kind | Purpose |
|---|---|---|
| `createPrimitiveTypeChecker(collectOnInit?, enableGet?)` | factory | Create a checker instance |
| `PrimitiveTypeChecker` | class | The checker class (extend to customise) |
| `setErrorReporter(fn)` / `getErrorReporter()` | functions | Swap the active reporter |
| `getTypeValue(value)` | function | Get the type string for any value |
| `checkPrimitiveType(storage, key, type)` | function | Low-level compatibility check |
| `REPORT_FIRST_TYPE_ONLY` | constant | Default: enforce first observed type |
| `REPORT_ALL_ASSIGNED_TYPES` | constant | Track every type ever assigned |
| `REPORT_NEVER` | constant | Disable tracking for a target |
| `setReportingLevel(target, level, perProp?)` | function | Per-object/per-property level override |
| `GET_PROPERTY`, `SET_PROPERTY`, `ARGUMENTS`, `RETURN_VALUE`, `MERGE` | constants | Action identifiers passed to the reporter |

## Quickstart

### Wrap an object

```ts
import { wrap, setDefaultTypeChecker } from '@actualwave/type-checkers';
import { createPrimitiveTypeChecker } from '@actualwave/primitive-type-checker';

setDefaultTypeChecker(createPrimitiveTypeChecker());

const state = wrap({ count: 0, label: 'hello', tags: [] });

state.count = 1;      // OK — number
state.count = 'one'; // reported: expected number, received string
state.tags  = {};    // reported: expected array, received object
```

### Custom error reporter (throw instead of log)

```ts
import { setErrorReporter } from '@actualwave/primitive-type-checker';

setErrorReporter((action, name, required, received) => {
  throw new TypeError(`[${action}] "${name}": expected ${required}, got ${received}`);
});
```

### Opt a property out of tracking

```ts
import { REPORT_NEVER, setReportingLevel } from '@actualwave/primitive-type-checker';

setReportingLevel(myObject, undefined, { dynamicProp: REPORT_NEVER });
```

## Type map

| Value | Type string |
|---|---|
| `undefined` | `''` (empty — not tracked) |
| Arrays | `'array'` |
| `null` / plain objects | `'object'` |
| Numbers | `'number'` |
| Strings | `'string'` |
| Booleans | `'boolean'` |
| Functions | `'function'` |
| Symbols | `'symbol'` |
| BigInt | `'bigint'` |

## Extending the checker

Override `getTypeValue` to support custom type semantics:

```ts
import PrimitiveTypeChecker from '@actualwave/primitive-type-checker';

class StrictNullChecker extends PrimitiveTypeChecker {
  getTypeValue(value: unknown): string {
    if (value === null) return 'null';
    return super.getTypeValue(value);
  }
}
```

## Reporter signature

```ts
type Reporter = (
  action: string,     // one of the action constants
  name: string,       // full property path, e.g. "parent.child[0]"
  required: string,   // the expected type (or '|'-joined list when multiple)
  received: string,   // the actual type of the assigned value
) => void;
```

## Notes

- `undefined` values have an empty-string type and are never tracked. Assigning `undefined` to a
  typed property does not trigger an error and does not change the stored type.
- The default reporting level is `REPORT_FIRST_TYPE_ONLY`: once a type is observed, any later
  assignment of a different type is reported and the stored type is NOT updated.
- When `collectTypesOnInit` is `true` (default), all existing properties of the wrapped object are
  scanned on first use, so initial values establish the expected types automatically.
