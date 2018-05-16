import has from 'lodash.has';

import {
  ARGUMENTS,
  GET_PROPERTY,
  RETURN_VALUE,
  SET_PROPERTY,
  MERGE,
  buildPath,
  AsIs,
} from '@actualwave/type-checkers/source/checkers/utils';

export const checkPrimitiveType = (action, types, name, type, errorReporter, sequence) => {
  if (!type) {
    return true;
  }

  const storedType = types[name];

  if (storedType) {
    if (storedType !== type) {
      errorReporter(action, buildPath([...sequence, name]), storedType, type);

      return false;
    }
  } else {
    types[name] = type;
  }

  return true;
};

export const mergeConfigs = ({ types, errorReporter }, source, names = []) => {
  const sourceTypes = source.types;

  for (const name in sourceTypes) {
    if (has(sourceTypes, name)) {
      const sourceType = sourceTypes[name];
      const targetType = types[name];

      if (sourceType && targetType && targetType !== sourceType) {
        errorReporter(MERGE, buildPath([...names, name]), targetType, sourceType);
      } else {
        types[name] = sourceType;
      }
    }
  }

  return { types, errorReporter };
};

export const getTypeString = (value) => {
  if (value === undefined) {
    return '';
  } else if (value instanceof Array) {
    return 'array';
  }

  return typeof value;
};

const getPropertyChecker = (action) => {
  function checkValueType(target, name, value, config, sequence) {
    const { types, errorReporter } = config;
    const type = this.getTypeString(value);

    return checkPrimitiveType(action, types, name, type, errorReporter, sequence);
  };

  return checkValueType;
};

export class PrimitiveTypeChecker {
  collectTypesOnInit = true;
  getTypeString = getTypeString;
  mergeConfigs = mergeConfigs;

  init(target, errorReporter, cachedTypes = null) {
    let types = {};

    if (cachedTypes) {
      types = cachedTypes;
    } else if (this.collectTypesOnInit) {
      Object.keys(target)
        .forEach((key) => {
          types[key] = getTypeString(target[key]);
        });
    }

    return {
      types,
      errorReporter,
    };
  }

  getProperty = getPropertyChecker(GET_PROPERTY);

  setProperty = getPropertyChecker(SET_PROPERTY);

  arguments(target, thisArg, args, config, sequence) {
    const { types, errorReporter } = config;

    const { length } = args;
    let valid = true;

    for (let index = 0; index < length; index++) {
      const type = this.getTypeString(args[index]);
      const agrValid = checkPrimitiveType(ARGUMENTS, types, String(index), type, errorReporter, sequence);

      valid = agrValid && valid;
    }

    return valid;
  }

  returnValue(target, thisArg, value, config, sequence) {
    const { types, errorReporter } = config;
    const type = this.getTypeString(value);

    return checkPrimitiveType(RETURN_VALUE, types, AsIs(RETURN_VALUE), type, errorReporter, sequence);
  }
}

export default PrimitiveTypeChecker;
