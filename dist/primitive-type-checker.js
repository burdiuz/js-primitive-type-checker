'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var hasOwn = _interopDefault(require('@actualwave/hasOwn'));

const MERGE = '(Merge)';
const GET_PROPERTY = '(GetProperty)';
const SET_PROPERTY = '(SetProperty)';
const ARGUMENTS = '(Arguments)';
const RETURN_VALUE = '(ReturnValue)';

function AsIs(value) {
  if (this instanceof AsIs) {
    this.value = value;
  } else {
    return new AsIs(value);
  }
}

function asIs() {
  return this.value;
}

AsIs.prototype.toString = asIs;
AsIs.prototype.valueOf = asIs;
AsIs.prototype[Symbol.toPrimitive] = asIs;

const buildPath = sequence => sequence.reduce((str, name) => {
  if (name instanceof AsIs) {
    return `${str}${name}`;
  } else if (String(parseInt(name, 10)) === name) {
    return `${str}[${name}]`;
  } else if (/^[a-z][\w$]*$/i.test(name)) {
    return str ? `${str}.${name}` : name;
  }

  return `${str}["${name}"]`;
}, '');

const checkPrimitiveType = (action, types, name, type, errorReporter, sequence) => {
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

const mergeConfigs = ({ types, errorReporter }, source, names = []) => {
  const sourceTypes = source.types;

  for (const name in sourceTypes) {
    if (hasOwn(sourceTypes, name)) {
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

    return checkPrimitiveType(action, types, name, type, errorReporter, sequence);
  }

  return checkValueType;
};

const getPropertyChecker = propertyCheckerFactory(GET_PROPERTY);
const setPropertyChecker = propertyCheckerFactory(SET_PROPERTY);

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

exports.MERGE = MERGE;
exports.ARGUMENTS = ARGUMENTS;
exports.GET_PROPERTY = GET_PROPERTY;
exports.RETURN_VALUE = RETURN_VALUE;
exports.SET_PROPERTY = SET_PROPERTY;
exports.buildPath = buildPath;
exports.AsIs = AsIs;
exports.checkPrimitiveType = checkPrimitiveType;
exports.mergeConfigs = mergeConfigs;
exports.getTypeString = getTypeString;
exports.propertyCheckerFactory = propertyCheckerFactory;
exports.default = PrimitiveTypeChecker;
//# sourceMappingURL=primitive-type-checker.js.map
