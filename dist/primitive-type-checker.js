'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var utils = require('@actualwave/primitive-type-checker/utils');

const hasOwn = (
  (has) =>
  (target, property) =>
  Boolean(target && has.call(target, property))
)(Object.prototype.hasOwnProperty);

const mergeConfigs = ({ types, errorReporter }, source, names = []) => {
  const sourceTypes = source.types;

  for (const name in sourceTypes) {
    if (hasOwn(sourceTypes, name)) {
      const sourceType = sourceTypes[name];
      const targetType = types[name];

      if (sourceType && targetType && targetType !== sourceType) {
        errorReporter(utils.MERGE, utils.buildPath([...names, name]), targetType, sourceType);
      } else {
        types[name] = sourceType;
      }
    }
  }

  return { types, errorReporter };
};

const getTypeString = value => {
  if (value === undefined) {
    return '';
  } else if (value instanceof Array) {
    return 'array';
  }

  return typeof value;
};

const propertyCheckerFactory = action => {
  function checkValueType(target, name, value, config, sequence) {
    const { types, errorReporter } = config;
    const type = this.getTypeString(value);

    return utils.checkPrimitiveType(action, types, name, type, errorReporter, sequence);
  }

  return checkValueType;
};

const getPropertyChecker = propertyCheckerFactory(utils.GET_PROPERTY);
const setPropertyChecker = propertyCheckerFactory(utils.SET_PROPERTY);

class PrimitiveTypeChecker {
  constructor() {
    this.collectTypesOnInit = true;
    this.getTypeString = getTypeString;
    this.mergeConfigs = mergeConfigs;
  }

  init(target, errorReporter, cachedTypes = null) {
    let types = {};

    if (cachedTypes) {
      types = cachedTypes;
    } else if (this.collectTypesOnInit) {
      Object.keys(target).forEach(key => {
        types[key] = getTypeString(target[key]);
      });
    }

    return {
      types,
      errorReporter
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
      const agrValid = utils.checkPrimitiveType(utils.ARGUMENTS, types, String(index), type, errorReporter, sequence);

      valid = agrValid && valid;
    }

    return valid;
  }

  returnValue(target, thisArg, value, config, sequence) {
    const { types, errorReporter } = config;
    const type = this.getTypeString(value);

    return utils.checkPrimitiveType(utils.RETURN_VALUE, types, utils.AsIs(utils.RETURN_VALUE), type, errorReporter, sequence);
  }
}

exports.mergeConfigs = mergeConfigs;
exports.getTypeString = getTypeString;
exports.propertyCheckerFactory = propertyCheckerFactory;
exports.default = PrimitiveTypeChecker;
//# sourceMappingURL=primitive-type-checker.js.map
