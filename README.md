# @actualwave/primitive-type-checker
[![Coverage Status](https://coveralls.io/repos/github/burdiuz/js-primitive-type-checker/badge.svg?branch=master)](https://coveralls.io/github/burdiuz/js-primitive-type-checker?branch=master)

Runtime type checker for primitive value types. Uses `typeof` to identify types and detects arrays specifically (since `typeof [] === 'object'`). Designed as a plugin for the [@actualwave/type-checkers](https://github.com/burdiuz/js-type-checkers) framework.

## Installation

```bash
npm install @actualwave/primitive-type-checker
```

## Usage

### With the type-checkers framework

```ts
import { wrap, setDefaultTypeChecker } from '@actualwave/type-checkers';
import { createPrimitiveTypeChecker } from '@actualwave/primitive-type-checker';

setDefaultTypeChecker(createPrimitiveTypeChecker());

const obj = wrap({ count: 0, label: 'hello', items: [] });

obj.count = 1;        // OK
obj.count = 'one';   // TypeError reported: expected number, received string
obj.items = {};      // TypeError reported: expected array, received object
```

### Custom error reporter

```ts
import { setErrorReporter } from '@actualwave/primitive-type-checker';

setErrorReporter((action, name, required, received) => {
  throw new TypeError(
    `${action} on "${name}": expected ${required}, got ${received}`
  );
});
```

### Reporting levels

Control how strictly types are tracked per object or property:

```ts
import {
  REPORT_FIRST_TYPE_ONLY,
  REPORT_ALL_ASSIGNED_TYPES,
  REPORT_NEVER,
  setReportingLevel,
} from '@actualwave/primitive-type-checker';

// Track only the first observed type (default)
setReportingLevel(obj, REPORT_FIRST_TYPE_ONLY);

// Accept any type ever assigned without reporting errors
setReportingLevel(obj, REPORT_NEVER);
```

## API

### `createPrimitiveTypeChecker(collectTypesOnInit?, enableGetChecker?)`

Factory function — returns a `PrimitiveTypeChecker` instance.

| Parameter | Type | Default | Description |
|---|---|---|---|
| `collectTypesOnInit` | `boolean` | `true` | Scan wrapped object properties on init to record initial types |
| `enableGetChecker` | `boolean` | `true` | Also check types on property reads, not just writes |

### `setErrorReporter(reporter)` / `getErrorReporter()`

Replace or retrieve the active error reporter.

```ts
type Reporter = (action: string, name: string, required: string, received: string) => void;
```

### Reporting level constants

| Constant | Meaning |
|---|---|
| `REPORT_FIRST_TYPE_ONLY` | Only the first observed type is enforced (default) |
| `REPORT_ALL_ASSIGNED_TYPES` | Every distinct type ever assigned is recorded |
| `REPORT_NEVER` | Type tracking disabled for the target |

### Action constants

Passed as the `action` argument to the error reporter:

| Constant | Value |
|---|---|
| `GET_PROPERTY` | `'(GetProperty)'` |
| `SET_PROPERTY` | `'(SetProperty)'` |
| `ARGUMENTS` | `'(Arguments)'` |
| `RETURN_VALUE` | `'(ReturnValue)'` |
| `MERGE` | `'(Merge)'` |

### `getTypeValue(value)`

Returns the type string for any value — same as `typeof` but returns `'array'` for arrays and `''` for `undefined`.

## Type detection

| Value | Returned type |
|---|---|
| `undefined` | `''` (empty string) |
| `[]`, `new Array()` | `'array'` |
| `{}`, `null` | `'object'` |
| `42`, `NaN` | `'number'` |
| `'text'` | `'string'` |
| `true` / `false` | `'boolean'` |
| `() => {}` | `'function'` |
| `Symbol()` | `'symbol'` |
| `1n` | `'bigint'` |

## License

MIT
