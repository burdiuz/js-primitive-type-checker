import { describe, it, expect } from '@jest/globals';
import {
  MERGE,
  GET_PROPERTY,
  SET_PROPERTY,
  ARGUMENTS,
  RETURN_VALUE,
  checkPrimitiveType,
  getTypeValue,
} from '../utils';
import { createTypesStorage } from '@actualwave/type-checker-levels-storage';

describe('action constants', () => {
  it('MERGE', () => expect(MERGE).toBe('(Merge)'));
  it('GET_PROPERTY', () => expect(GET_PROPERTY).toBe('(GetProperty)'));
  it('SET_PROPERTY', () => expect(SET_PROPERTY).toBe('(SetProperty)'));
  it('ARGUMENTS', () => expect(ARGUMENTS).toBe('(Arguments)'));
  it('RETURN_VALUE', () => expect(RETURN_VALUE).toBe('(ReturnValue)'));
});

describe('getTypeValue()', () => {
  it('returns empty string for undefined', () => expect(getTypeValue(undefined)).toBe(''));
  it('returns "number" for numbers', () => expect(getTypeValue(42)).toBe('number'));
  it('returns "string" for strings', () => expect(getTypeValue('hello')).toBe('string'));
  it('returns "boolean" for booleans', () => expect(getTypeValue(true)).toBe('boolean'));
  it('returns "object" for plain objects', () => expect(getTypeValue({})).toBe('object'));
  it('returns "array" for arrays', () => expect(getTypeValue([])).toBe('array'));
  it('returns "function" for functions', () => expect(getTypeValue(() => {})).toBe('function'));
  it('returns "object" for null', () => expect(getTypeValue(null)).toBe('object'));
  it('returns "bigint" for bigint', () => expect(getTypeValue(1n)).toBe('bigint'));
  it('returns "symbol" for symbols', () => expect(getTypeValue(Symbol())).toBe('symbol'));
});

describe('checkPrimitiveType()', () => {
  it('returns true when key not in storage', () => {
    const storage = createTypesStorage<string, string>();
    expect(checkPrimitiveType(storage, 'x', 'number')).toBe(true);
  });

  it('returns true when key exists with matching type', () => {
    const storage = createTypesStorage<string, string>();
    storage.addFor('x', 'number', {});
    expect(checkPrimitiveType(storage, 'x', 'number')).toBe(true);
  });

  it('returns false when key exists with different type', () => {
    const storage = createTypesStorage<string, string>();
    storage.addFor('x', 'number', {});
    expect(checkPrimitiveType(storage, 'x', 'string')).toBe(false);
  });
});
