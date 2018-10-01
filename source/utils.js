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

  const storedType = storage.hasType(lastName);

  if (storedType) {
    if (storedType !== type) {
      const errorReporter = getErrorReporter();

      errorReporter(action, names.toString(), storedType, type);

      return false;
    }
  } else {
    storage.addFor(lastName, type, target);
  }

  return true;
};
