import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { createTypesStorage } from '@actualwave/type-checker-levels-storage';
import { setErrorReporter, getErrorReporter } from '../error-reporter';
import { MERGE, GET_PROPERTY, SET_PROPERTY, ARGUMENTS, RETURN_VALUE } from '../utils';
import PrimitiveTypeChecker, { createPrimitiveTypeChecker, PropertyNames } from '../checker';

class MockNames implements PropertyNames {
  private _lastName: string;
  private _path: string;

  constructor(lastName: string, path = '') {
    this._lastName = lastName;
    this._path = path;
  }

  get lastName(): string {
    return this._lastName;
  }

  toString(): string {
    return this._path ? `${this._path}.${this._lastName}` : this._lastName;
  }

  clone(index?: number | string): MockNames {
    const suffix = index !== undefined ? `[${index}]` : '';
    return new MockNames(this._lastName + suffix, this._path);
  }

  appendCustomValue(value: string): void {
    this._lastName += value;
  }
}

const makeNames = (lastName: string, path = '') => new MockNames(lastName, path);

describe('PrimitiveTypeChecker', () => {
  let reporter: ReturnType<typeof jest.fn>;
  let checker: PrimitiveTypeChecker;
  let target: Record<string, unknown>;

  beforeEach(() => {
    reporter = jest.fn();
    setErrorReporter(reporter as never);
    target = { num: 1, str: 'a', bool: true, obj: {}, arr: [] };
    checker = new PrimitiveTypeChecker();
  });

  describe('init()', () => {
    it('collects types from target when collectTypesOnInit is true', () => {
      const storage = checker.init(target)!;
      expect(storage.hasValue('num', 'number')).toBe(true);
      expect(storage.hasValue('str', 'string')).toBe(true);
      expect(storage.hasValue('bool', 'boolean')).toBe(true);
      expect(storage.hasValue('obj', 'object')).toBe(true);
      expect(storage.hasValue('arr', 'array')).toBe(true);
    });

    it('returns undefined when collectTypesOnInit is false and no cached storage', () => {
      checker.collectTypesOnInit = false;
      expect(checker.init(target)).toBeUndefined();
    });

    it('returns cached storage as-is when provided', () => {
      const cached = createTypesStorage<string, string>();
      expect(checker.init(target, cached)).toBe(cached);
    });

    it('returns cached storage even when collectTypesOnInit is false', () => {
      checker.collectTypesOnInit = false;
      const cached = createTypesStorage<string, string>();
      expect(checker.init(target, cached)).toBe(cached);
    });
  });

  describe('getTypeValue()', () => {
    it('delegates to getTypeValue utility', () => {
      expect(checker.getTypeValue(1)).toBe('number');
      expect(checker.getTypeValue('x')).toBe('string');
      expect(checker.getTypeValue(true)).toBe('boolean');
      expect(checker.getTypeValue({})).toBe('object');
      expect(checker.getTypeValue([])).toBe('array');
      expect(checker.getTypeValue(undefined)).toBe('');
    });
  });

  describe('isTypeCompatible()', () => {
    it('returns true when key has no stored type', () => {
      const storage = createTypesStorage<string, string>();
      expect(checker.isTypeCompatible(storage, 'x', 'number')).toBe(true);
    });

    it('returns true when type matches stored type', () => {
      const storage = createTypesStorage<string, string>();
      storage.addFor('x', 'number', {});
      expect(checker.isTypeCompatible(storage, 'x', 'number')).toBe(true);
    });

    it('returns false when type differs from stored type', () => {
      const storage = createTypesStorage<string, string>();
      storage.addFor('x', 'number', {});
      expect(checker.isTypeCompatible(storage, 'x', 'string')).toBe(false);
    });
  });

  describe('checkValueType()', () => {
    it('returns true and skips check for empty type (undefined value)', () => {
      const storage = createTypesStorage<string, string>();
      expect(checker.checkValueType(GET_PROPERTY, storage, target, makeNames('x'), '')).toBe(true);
      expect(reporter).not.toHaveBeenCalled();
    });

    it('returns true and stores type on first assignment', () => {
      const storage = createTypesStorage<string, string>();
      const names = makeNames('x');
      expect(checker.checkValueType(SET_PROPERTY, storage, target, names, 'number')).toBe(true);
      expect(storage.hasValue('x', 'number')).toBe(true);
      expect(reporter).not.toHaveBeenCalled();
    });

    it('returns false and reports error on type mismatch', () => {
      const storage = createTypesStorage<string, string>();
      storage.addFor('x', 'number', target);
      const names = makeNames('x');
      expect(checker.checkValueType(SET_PROPERTY, storage, target, names, 'string')).toBe(false);
      expect(reporter).toHaveBeenCalledWith(SET_PROPERTY, 'x', 'number', 'string');
    });

    it('uses names.toString() as the error path', () => {
      const storage = createTypesStorage<string, string>();
      storage.addFor('prop', 'number', target);
      const names = makeNames('prop', 'a.b');
      checker.checkValueType(SET_PROPERTY, storage, target, names, 'string');
      expect(reporter).toHaveBeenCalledWith(SET_PROPERTY, 'a.b.prop', 'number', 'string');
    });
  });

  describe('mergeConfigs()', () => {
    it('copies types from source to destination without conflicts', () => {
      const dest = createTypesStorage<string, string>();
      dest.addFor('x', 'number', target);

      const src = createTypesStorage<string, string>();
      src.addFor('y', 'string', target);

      checker.mergeConfigs(dest, src, 'myProp');

      expect(dest.hasValue('x', 'number')).toBe(true);
      expect(dest.hasValue('y', 'string')).toBe(true);
      expect(reporter).not.toHaveBeenCalled();
    });

    it('reports MERGE error when types conflict', () => {
      const dest = createTypesStorage<string, string>();
      dest.addFor('x', 'number', target);

      const src = createTypesStorage<string, string>();
      src.addFor('x', 'string', target);

      checker.mergeConfigs(dest, src, 'myProp');

      expect(reporter).toHaveBeenCalledWith(MERGE, 'myProp', 'number', 'string');
    });
  });

  describe('getProperty()', () => {
    it('always returns true when enableGetChecker is false', () => {
      checker.enableGetChecker = false;
      const storage = createTypesStorage<string, string>();
      storage.addFor('x', 'number', target);
      expect(checker.getProperty(target, makeNames('x'), 'wrong type', storage)).toBe(true);
      expect(reporter).not.toHaveBeenCalled();
    });

    it('returns true for matching type', () => {
      const storage = createTypesStorage<string, string>();
      storage.addFor('x', 'number', target);
      expect(checker.getProperty(target, makeNames('x'), 42, storage)).toBe(true);
      expect(reporter).not.toHaveBeenCalled();
    });

    it('returns false and reports error for mismatched type', () => {
      const storage = createTypesStorage<string, string>();
      storage.addFor('x', 'number', target);
      expect(checker.getProperty(target, makeNames('x'), 'oops', storage)).toBe(false);
      expect(reporter).toHaveBeenCalledWith(GET_PROPERTY, 'x', 'number', 'string');
    });
  });

  describe('setProperty()', () => {
    it('returns true for matching type', () => {
      const storage = createTypesStorage<string, string>();
      storage.addFor('x', 'string', target);
      expect(checker.setProperty(target, makeNames('x'), 'hello', storage)).toBe(true);
      expect(reporter).not.toHaveBeenCalled();
    });

    it('returns false and reports error for mismatched type', () => {
      const storage = createTypesStorage<string, string>();
      storage.addFor('x', 'string', target);
      expect(checker.setProperty(target, makeNames('x'), 99, storage)).toBe(false);
      expect(reporter).toHaveBeenCalledWith(SET_PROPERTY, 'x', 'string', 'number');
    });
  });

  describe('arguments()', () => {
    it('returns true when all argument types match', () => {
      const storage = createTypesStorage<string, string>();
      const names = makeNames('fn');
      checker.arguments(target, names, [false, 0, ''], storage);
      expect(checker.arguments(target, names, [true, 1, 'abc'], storage)).toBe(true);
      expect(reporter).not.toHaveBeenCalled();
    });

    it('returns false and reports errors for type mismatches', () => {
      const storage = createTypesStorage<string, string>();
      const names = makeNames('fn');
      checker.arguments(target, names, [false, 0, ''], storage);
      checker.arguments(target, names, [true, 'oops', null], storage);
      expect(reporter).toHaveBeenCalledWith(ARGUMENTS, 'fn[1]', 'number', 'string');
      expect(reporter).toHaveBeenCalledWith(ARGUMENTS, 'fn[2]', 'string', 'object');
    });

    it('uses index as part of the storage key', () => {
      const storage = createTypesStorage<string, string>();
      const names = makeNames('');
      checker.arguments(target, names, [1], storage);
      checker.arguments(target, names, ['wrong'], storage);
      expect(reporter).toHaveBeenCalledWith(ARGUMENTS, '[0]', 'number', 'string');
    });
  });

  describe('returnValue()', () => {
    it('returns true for matching return type', () => {
      const storage = createTypesStorage<string, string>();
      const names = makeNames('fn');
      checker.returnValue(target, names, 'hello', storage);
      expect(checker.returnValue(target, names, 'world', storage)).toBe(true);
      expect(reporter).not.toHaveBeenCalled();
    });

    it('returns false and reports error for mismatched return type', () => {
      const storage = createTypesStorage<string, string>();
      const names = makeNames('fn');
      checker.returnValue(target, names, 'hello', storage);
      checker.returnValue(target, names, 42, storage);
      expect(reporter).toHaveBeenCalledWith(RETURN_VALUE, `fn${RETURN_VALUE}`, 'string', 'number');
    });

    it('includes parent path in error message', () => {
      const storage = createTypesStorage<string, string>();
      const names = makeNames('fn', 'obj');
      checker.returnValue(target, names, false, storage);
      checker.returnValue(target, names, 0, storage);
      expect(reporter).toHaveBeenCalledWith(RETURN_VALUE, `obj.fn${RETURN_VALUE}`, 'boolean', 'number');
    });
  });
});

describe('createPrimitiveTypeChecker()', () => {
  it('creates a PrimitiveTypeChecker with defaults', () => {
    const checker = createPrimitiveTypeChecker();
    expect(checker).toBeInstanceOf(PrimitiveTypeChecker);
    expect(checker.collectTypesOnInit).toBe(true);
    expect(checker.enableGetChecker).toBe(true);
  });

  it('respects provided arguments', () => {
    const checker = createPrimitiveTypeChecker(false, false);
    expect(checker.collectTypesOnInit).toBe(false);
    expect(checker.enableGetChecker).toBe(false);
  });
});
