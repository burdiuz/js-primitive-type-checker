import has from 'lodash.has';

import {
  MERGE,
  ARGUMENTS,
  GET_PROPERTY,
  RETURN_VALUE,
  SET_PROPERTY,
  buildPath,
  AsIs,
  checkPrimitiveType,
} from './utils';

export const mergeConfigs = ({ types, errorReporter }, source, names = []) => {
  const sourceTypes = source.types;

  for (const name in sourceTypes) {
    if (has(sourceTypes, name)) {
      const sourceType = sourceTypes[name];
      const targetType = types[name];

      if (sourceType && targetType && targetType !== sourceType) {
        errorReporter(
          MERGE,
          buildPath([...names, name]),
          targetType,
          sourceType,
        );
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

export const propertyCheckerFactory = (action) => {
  function checkValueType(target, name, value, config, sequence) {
    const { types, errorReporter } = config;
    const type = this.getTypeString(value);

    return checkPrimitiveType(
      action,
      types,
      name,
      type,
      errorReporter,
      sequence,
    );
  }

  return checkValueType;
};

const getPropertyChecker = propertyCheckerFactory(GET_PROPERTY);
const setPropertyChecker = propertyCheckerFactory(SET_PROPERTY);

class PrimitiveTypeChecker {
  collectTypesOnInit = true;
  getTypeString = getTypeString;
  mergeConfigs = mergeConfigs;

  init(target, errorReporter, cachedTypes = null) {
    let types = {};

    if (cachedTypes) {
      types = cachedTypes;
    } else if (this.collectTypesOnInit) {
      Object.keys(target).forEach((key) => {
        types[key] = getTypeString(target[key]);
      });
    }

    return {
      types,
      errorReporter,
    };
  }

  getProperty(target, name, value, config, sequence) {
    return getPropertyChecker.call(this, target, name, value, config, sequence);
  }

  setProperty(target, name, value, config, sequence) {
    return setPropertyChecker.call(this, target, name, value, config, sequence);
  }

  arguments(target, thisArg, args, config, sequence) {
    const { types, errorReporter } = config;

    const { length } = args;
    let valid = true;

    for (let index = 0; index < length; index++) {
      const type = this.getTypeString(args[index]);
      const agrValid = checkPrimitiveType(
        ARGUMENTS,
        types,
        String(index),
        type,
        errorReporter,
        sequence,
      );

      valid = agrValid && valid;
    }

    return valid;
  }

  returnValue(target, thisArg, value, config, sequence) {
    const { types, errorReporter } = config;
    const type = this.getTypeString(value);

    return checkPrimitiveType(
      RETURN_VALUE,
      types,
      AsIs(RETURN_VALUE),
      type,
      errorReporter,
      sequence,
    );
  }
}

export default PrimitiveTypeChecker;
