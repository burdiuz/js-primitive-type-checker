(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define(['exports'], factory) :
  (factory((global.PrimitiveTypeChecker = {})));
}(this, (function (exports) { 'use strict';

  const GET_PROPERTY = '(GetProperty)';
  const SET_PROPERTY = '(SetProperty)';
  const ARGUMENTS = '(Arguments)';
  const RETURN_VALUE = '(ReturnValue)';
  const MERGE = '(Merge)';

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

  const buildPath = (sequence) => sequence
    .reduce((str, name) => {
      if (name instanceof AsIs) {
        str = `${str}${name}`;
      } else if (String(parseInt(name, 10)) === name) {
        str = `${str}[${name}]`;
      } else if (/^[a-z][\w$]*$/i.test(name)) {
        str = str ? `${str}.${name}` : name;
      } else {
        str = `${str}["${name}"]`;
      }

      return str;
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
      if (sourceTypes.hasOwnProperty(name)) {
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

  const PrimitiveTypeChecker = {
    collectTypesOnInit: true,
    areArrayElementsOfSameType: true,

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
    },

    getProperty(target, name, value, config, sequence) {
      const { types, errorReporter } = config;
      const type = getTypeString(value);

      return checkPrimitiveType(GET_PROPERTY, types, name, type, errorReporter, sequence);
    },

    setProperty(target, name, newValue, config, sequence) {
      const { types, errorReporter } = config;
      const type = getTypeString(newValue);

      return checkPrimitiveType(SET_PROPERTY, types, name, type, errorReporter, sequence);
    },

    arguments(target, thisArg, args, config, sequence) {
      const { types, errorReporter } = config;

      const { length } = args;
      let valid = true;

      for (let index = 0; index < length; index++) {
        const type = getTypeString(args[index]);
        const agrValid = checkPrimitiveType(ARGUMENTS, types, String(index), type, errorReporter, sequence);

        valid = agrValid && valid;
      }

      return valid;
    },

    returnValue(target, thisArg, value, config, sequence) {
      const { types, errorReporter } = config;

      const type = getTypeString(value);

      return checkPrimitiveType(RETURN_VALUE, types, AsIs(RETURN_VALUE), type, errorReporter, sequence);
    },
    getTypeString,
    mergeConfigs
  };

  exports.mergeConfigs = mergeConfigs;
  exports.getTypeString = getTypeString;
  exports.default = PrimitiveTypeChecker;

  Object.defineProperty(exports, '__esModule', { value: true });

})));
//# sourceMappingURL=primitive-type-checker.js.map
