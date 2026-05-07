import { createTypesStorage } from '@actualwave/type-checker-levels-storage';

export const MERGE = '(Merge)';
export const GET_PROPERTY = '(GetProperty)';
export const SET_PROPERTY = '(SetProperty)';
export const ARGUMENTS = '(Arguments)';
export const RETURN_VALUE = '(ReturnValue)';

export type TypeStorage = ReturnType<typeof createTypesStorage<string, string>>;

export const checkPrimitiveType = (storage: TypeStorage, key: string, type: string): boolean =>
  !storage.has(key) || storage.hasValue(key, type);

export const getTypeValue = (value: unknown): string => {
  if (value === undefined) {
    return '';
  }

  const type = typeof value;

  if (type === 'object' && value instanceof Array) {
    return 'array';
  }

  return type;
};
