import { getErrorReporter } from './error-reporter';

export const MERGE = '(Merge)';
export const GET_PROPERTY = '(GetProperty)';
export const SET_PROPERTY = '(SetProperty)';
export const ARGUMENTS = '(Arguments)';
export const RETURN_VALUE = '(ReturnValue)';

export const checkPrimitiveType = (storage, key, type) => {
  return !storage.has(key) || storage.hasValue(key, type);
};

export const getTypeValue = (value) => {
  if (value === undefined) {
    return '';
  }

  const type = typeof value;

  if (type === 'object' && value instanceof Array) {
    return 'array';
  }

  return type;
};
