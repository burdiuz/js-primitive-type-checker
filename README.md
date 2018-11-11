# Primitive Type Checker
[![Coverage Status](https://coveralls.io/repos/github/burdiuz/js-primitive-type-checker/badge.svg?branch=master)](https://coveralls.io/github/burdiuz/js-primitive-type-checker?branch=master)
[![Build Status](https://travis-ci.org/burdiuz/js-primitive-type-checker.svg?branch=master)](https://travis-ci.org/burdiuz/js-primitive-type-checker)  

Type Checker to use with [Type Checkers library](https://github.com/burdiuz/js-type-checkers), it compares `typeof` strings retrieved from values. Also, it checks if object is an Array and reports type error if non-Array object is assigned instead of Array.


## Demo
 * [Using Primitive Type Checker](https://jsfiddle.net/actualwave/25oq0npy/)


<a name="installation"></a>
## Installation

Via NPM
```bash
npm install @actualwave/@actualwave/primitive-type-checker --save
```
Or Yarn
```bash
yarn add @actualwave/@actualwave/primitive-type-checker
```


## How to use

Primitive Type Checker can be created using factory function `createPrimitiveTypeChecker()`, it accepts two optional arguments:
 * **collectTypesOnInit**  -- Primitive Type Checker will read through all own properties of wrapped object and record types of their initial values. True, by default.
 * **enableGetChecker** -- Enables type check on accessing properties. May be useful if original object was changed not via wrapper and Type Checker is not aware of this change. Will raise error if accessed property contains value of wrong type. True, by default.

```javascript
import { wrap, setDefaultTypeChecker } from '@actualwave/type-checkers';
import { createPrimitiveTypeChecker } from '@actualwave/primitive-type-checker';

const MyTypeChecker = createPrimitiveTypeChecker(true, false);
```
  
By default, Primitive type checker uses `ConsoleErrorReporter`  from  [@actualwave/type-checker-simple-reporting](https://github.com/burdiuz/js-type-checker-simple-reporting) that simply reports type errors via `console.error()`. Developer may change reporting function via `getErrorReporter()`/`setErrorReporter()` interface.
```javascript
import { setErrorReporter } from '@actualwave/primitive-type-checker';

const MyErrorReporter = (action, name, required, received) => {
  throw new Error(`${action}Error on "${name}" instead of "${required}" received "${received}"`);
};

setErrorReporter(MyErrorReporter);
```

> Written with [StackEdit](https://stackedit.io/).

### TODO
1. When setting property and its type is not specified, read the property and get type from the value if available.
