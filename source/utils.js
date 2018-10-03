import { getErrorReporter } from './error-reporter';

export const MERGE = '(Merge)';
export const GET_PROPERTY = '(GetProperty)';
export const SET_PROPERTY = '(SetProperty)';
export const ARGUMENTS = '(Arguments)';
export const RETURN_VALUE = '(ReturnValue)';

export const checkPrimitiveType = (action, storage, target, names, type) => {
  if (!type) {
    return true;
  }

  const { lastName } = names;

  const missingType = storage.has(lastName) && !storage.hasValue(lastName, type);

  if (missingType) {
    const errorReporter = getErrorReporter();

    errorReporter(action, names.toString(), storage.list(lastName).join(', '), type);
  }

  storage.addFor(lastName, type, target);

  return !missingType;
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
