(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
	typeof define === 'function' && define.amd ? define(['exports'], factory) :
	(factory((global.PrimitiveTypeChecker = {})));
}(this, (function (exports) { 'use strict';

	function unwrapExports (x) {
		return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, 'default') ? x['default'] : x;
	}

	function createCommonjsModule(fn, module) {
		return module = { exports: {} }, fn(module, module.exports), module.exports;
	}

	var hasOwn_1 = createCommonjsModule(function (module, exports) {

	Object.defineProperty(exports, '__esModule', { value: true });

	const hasOwn = (
	  (has) =>
	  (target, property) =>
	  Boolean(target && has.call(target, property))
	)(Object.prototype.hasOwnProperty);

	exports.hasOwn = hasOwn;
	exports.default = hasOwn;
	});

	unwrapExports(hasOwn_1);
	var hasOwn_2 = hasOwn_1.hasOwn;

	var mapOfSets = createCommonjsModule(function (module, exports) {

	Object.defineProperty(exports, '__esModule', { value: true });

	class MapOfSets {
	  constructor() {
	    this.storage = new Map();
	  }
	  /**
	   * Check if key exists
	   * @param {*} key
	   */


	  has(key) {
	    const values = this.storage.get(key);
	    return values && values.size;
	  }
	  /**
	   * Check if value exists for key
	   * @param {*} key
	   * @param {*} value
	   */


	  hasValue(key, value) {
	    const values = this.storage.get(key);
	    return values && values.has(value);
	  }
	  /**
	   * Get Set of values for key
	   * @param {*} key
	   */


	  get(key) {
	    return this.storage.get(key);
	  }
	  /**
	   * List values for key, returns empty array if no key nor values stored
	   * @param {*} key
	   */


	  list(key) {
	    const values = this.storage.get(key);
	    return values ? Array.from(values) : [];
	  }
	  /**
	   * Call callback for each value of each key
	   *  callback (value:*, key:*, storage:*):void
	   * @param {Function} callback
	   */


	  forEach(callback) {
	    this.storage.forEach((values, key) => values.forEach(value => callback(value, key, this)));
	  }
	  /**
	   * Call callback function for each value of specified key
	   *  callback (value:*, key:*, storage:*):void
	   * @param {*} key
	   * @param {Function} callback
	   */


	  eachValue(key, callback) {
	    const values = this.storage.get(key);

	    if (values) {
	      values.forEach(value => callback(value, key, this));
	    }
	  }
	  /**
	   * Add to new value to key.
	   * @param {*} key
	   * @param {*} value
	   */


	  add(key, value) {
	    if (!value) return;
	    const values = this.storage.get(key);

	    if (values) {
	      values.add(value);
	    } else {
	      this.storage.set(key, new Set([value]));
	    }
	  }
	  /**
	   * Replace all values for key
	   * @param {*} key
	   * @param {Set} types
	   */


	  set(key, values) {
	    if (!values || values.size === 0) {
	      this.remove(key);
	      return;
	    }

	    this.storage.set(key, new Set(values));
	  }
	  /**
	   * Remove all values for key
	   * @param {*} key
	   */


	  remove(key) {
	    this.storage.delete(key);
	  }
	  /**
	   * Remove single value from key
	   * @param {*} key
	   * @param {*} value
	   */


	  removeValue(key, value) {
	    const values = this.storage.get(key);

	    if (values) {
	      values.delete(value);

	      if (!values.size) {
	        this.remove(key);
	      }
	    }
	  }
	  /**
	   * Clone all key-value stores
	   */


	  clone() {
	    const target = new MapOfSets();
	    this.storage.forEach((values, key) => target.set(key, new Set(values)));
	    return target;
	  }

	}
	const createMapOfSets = () => new MapOfSets();

	exports.MapOfSets = MapOfSets;
	exports.createMapOfSets = createMapOfSets;
	exports.default = MapOfSets;

	});

	unwrapExports(mapOfSets);
	var mapOfSets_1 = mapOfSets.MapOfSets;
	var mapOfSets_2 = mapOfSets.createMapOfSets;

	var typeCheckerLevelsStorage = createCommonjsModule(function (module, exports) {

	Object.defineProperty(exports, '__esModule', { value: true });

	function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

	var hasOwn = _interopDefault(hasOwn_1);
	var MapOfSets = _interopDefault(mapOfSets);

	/**
	 * Do not check or report type inconsistency
	 */
	const REPORT_NEVER = 'never';
	/**
	 * Report type inconsistency once, i.e. record all types and report new
	 */
	const REPORT_ONCE = 'once';
	/**
	 * Report whenever type is inconsistent with initial
	 */
	const REPORT_ALL = 'all';

	const REPORT_KEY = Symbol('type-checkers:report-level');
	const PROPERTY_REPORT_KEY = Symbol('type-checkers:property-report-level');

	let globalReportingLevel = REPORT_ALL;

	const validateReportingLevel = level => {
	  switch (level) {
	    case REPORT_NEVER:
	    case REPORT_ONCE:
	      return level;
	    default:
	      return REPORT_ALL;
	  }
	};

	const setGlobalReportingLevel = level => {
	  globalReportingLevel = validateReportingLevel(level);
	};

	const getGlobalReportingLevel = () => globalReportingLevel;

	const setTargetGeneralReportingLevel = (target, level) => {
	  if (level) {
	    target[REPORT_KEY] = validateReportingLevel(level);
	  } else {
	    delete target[REPORT_KEY];
	  }
	};

	const setTargetPropertyReportingLevel = (target, perPropertyLevels) => {
	  if (!perPropertyLevels) {
	    delete target[PROPERTY_REPORT_KEY];
	    return;
	  }

	  target[PROPERTY_REPORT_KEY] = Object.keys(perPropertyLevels).reduce((levels, prop) => {
	    levels[prop] = validateReportingLevel(perPropertyLevels[prop]);
	    return levels;
	  }, {});
	};

	const setReportingLevel = (target, generalLevel, perPropertyLevels) => {
	  setTargetGeneralReportingLevel(target, generalLevel);
	  setTargetPropertyReportingLevel(target, perPropertyLevels);
	};

	const getTargetReportingLevel = (target, key) => {
	  if (hasOwn(target[PROPERTY_REPORT_KEY], key)) {
	    return target[PROPERTY_REPORT_KEY][key];
	  }

	  return target[REPORT_KEY];
	};

	const getReportingLevel = (target, key) => {
	  let level = getTargetReportingLevel(target, key);

	  if (!level) {
	    level = getTargetReportingLevel(target.constructor, key);
	  }

	  return level || getGlobalReportingLevel();
	};

	/**
	 *
	 * @param {any} key
	 * @param {Set} target
	 * @param {Set} source
	 */
	const defaultMergeStrategy = (key, target, source) => {
	  source.forEach(type => {
	    if (!target.has(type)) {
	      target.add(type);
	    }
	  });

	  return target;
	};

	class TypeInfoStorage extends MapOfSets {
	  /**
	   * Add to type information for specified key.
	   * @param {*} key
	   * @param {*} type
	   * @param {Number} level
	   */
	  add(key, type, level) {
	    if (!type) return;

	    switch (level) {
	      case REPORT_NEVER:
	        this.remove(key);
	        break;
	      case REPORT_ONCE:
	        super.add(key, type);
	        break;
	      case REPORT_ALL:
	      default:
	        {
	          const types = this.storage.get(key);

	          if (!types || !types.size) {
	            this.storage.set(key, new Set([type]));
	          }
	        }
	        break;
	    }
	  }

	  addFor(key, type, target) {
	    this.add(key, type, getReportingLevel(target, key));
	  }

	  /**
	   * Replace types information for specific key
	   * @param {*} key
	   * @param {Set} types
	   * @param {Number} level
	   */
	  set(key, types, level) {
	    if (!types || types.size === 0 || level === REPORT_NEVER) {
	      this.remove(key);
	      return;
	    }

	    super.set(key, types);
	  }

	  /**
	   *
	   * @param {*} key
	   * @param {Set} types
	   * @param {Object} target
	   */
	  setFor(key, types, target) {
	    return this.set(key, types, getReportingLevel(target, key));
	  }

	  clone() {
	    const target = new TypeInfoStorage();
	    this.storage.forEach((types, key) => target.set(key, new Set(types)));

	    return target;
	  }

	  /**
	   * Copy types from current storage to storage passed as first argument.
	   * @param {Map} storage
	   * @param {Object} [target]
	   * @param {Function} [mergeStrategy]
	   */
	  copyTo(storage, target, mergeStrategy = defaultMergeStrategy) {
	    this.storage.forEach((types, key) => {
	      const level = validateReportingLevel(target && getReportingLevel(target, key));

	      switch (level) {
	        case REPORT_ALL:
	        case REPORT_ONCE:
	          if (storage.has(key)) {
	            storage.set(key, mergeStrategy(key, storage.get(key), types, level), level);
	          } else {
	            storage.set(key, new Set(types));
	          }
	          break;
	        case REPORT_NEVER:
	        default:
	          break;
	      }
	    });

	    return storage;
	  }
	}

	const createTypesStorage = () => new TypeInfoStorage();

	exports.REPORT_ALL = REPORT_ALL;
	exports.REPORT_NEVER = REPORT_NEVER;
	exports.REPORT_ONCE = REPORT_ONCE;
	exports.createTypesStorage = createTypesStorage;
	exports.defaultMergeStrategy = defaultMergeStrategy;
	exports.getGlobalReportingLevel = getGlobalReportingLevel;
	exports.setGlobalReportingLevel = setGlobalReportingLevel;
	exports.getReportingLevel = getReportingLevel;
	exports.setReportingLevel = setReportingLevel;

	});

	unwrapExports(typeCheckerLevelsStorage);
	var typeCheckerLevelsStorage_1 = typeCheckerLevelsStorage.REPORT_ALL;
	var typeCheckerLevelsStorage_2 = typeCheckerLevelsStorage.REPORT_NEVER;
	var typeCheckerLevelsStorage_3 = typeCheckerLevelsStorage.REPORT_ONCE;
	var typeCheckerLevelsStorage_4 = typeCheckerLevelsStorage.createTypesStorage;
	var typeCheckerLevelsStorage_5 = typeCheckerLevelsStorage.defaultMergeStrategy;
	var typeCheckerLevelsStorage_6 = typeCheckerLevelsStorage.getGlobalReportingLevel;
	var typeCheckerLevelsStorage_7 = typeCheckerLevelsStorage.setGlobalReportingLevel;
	var typeCheckerLevelsStorage_8 = typeCheckerLevelsStorage.getReportingLevel;
	var typeCheckerLevelsStorage_9 = typeCheckerLevelsStorage.setReportingLevel;

	var typeCheckerSimpleReporting = createCommonjsModule(function (module, exports) {

	Object.defineProperty(exports, '__esModule', { value: true });

	/* eslint-disable import/prefer-default-export */

	const constructErrorString = (action, name, required, received) => `${action}Error on "${name}" instead of "${required}" received "${received}"`;

	/* eslint-disable no-console */

	const ConsoleErrorReporter = (action, name, requiredTypeString, actualTypeString) => console.error(constructErrorString(action, name, requiredTypeString, actualTypeString));

	const ConsoleWarnReporter = (action, name, requiredTypeString, actualTypeString) => console.warn(constructErrorString(action, name, requiredTypeString, actualTypeString));

	/* eslint-disable import/prefer-default-export */

	const ThrowErrorReporter = (action, name, requiredTypeString, receivedTypeString) => {
	  throw new Error(constructErrorString(action, name, requiredTypeString, receivedTypeString));
	};

	exports.ConsoleErrorReporter = ConsoleErrorReporter;
	exports.ConsoleWarnReporter = ConsoleWarnReporter;
	exports.ThrowErrorReporter = ThrowErrorReporter;

	});

	unwrapExports(typeCheckerSimpleReporting);
	var typeCheckerSimpleReporting_1 = typeCheckerSimpleReporting.ConsoleErrorReporter;
	var typeCheckerSimpleReporting_2 = typeCheckerSimpleReporting.ConsoleWarnReporter;
	var typeCheckerSimpleReporting_3 = typeCheckerSimpleReporting.ThrowErrorReporter;

	let errorReporter = typeCheckerSimpleReporting_1;
	const getErrorReporter = () => errorReporter;
	const setErrorReporter = value => {
	  errorReporter = value;
	};

	const MERGE = '(Merge)';
	const GET_PROPERTY = '(GetProperty)';
	const SET_PROPERTY = '(SetProperty)';
	const ARGUMENTS = '(Arguments)';
	const RETURN_VALUE = '(ReturnValue)';
	const checkPrimitiveType = (action, storage, target, names, type) => {
	  if (!type) {
	    return true;
	  }

	  const {
	    lastName
	  } = names;
	  const missingType = storage.has(lastName) && !storage.hasValue(lastName, type);

	  if (missingType) {
	    const errorReporter = getErrorReporter();
	    errorReporter(action, names.toString(), storage.list(lastName).join(', '), type);
	  }

	  storage.addFor(lastName, type, target);
	  return !missingType;
	};
	const getTypeValue = value => {
	  if (value === undefined) {
	    return '';
	  }

	  const type = typeof value;

	  if (type === 'object' && value instanceof Array) {
	    return 'array';
	  }

	  return type;
	};

	/* eslint-disable class-methods-use-this */

	class PrimitiveTypeChecker {
	  constructor(collectTypesOnInit = true, enableGetChecker = true) {
	    this.collectTypesOnInit = collectTypesOnInit;
	    this.enableGetChecker = enableGetChecker;
	  }

	  init(target, cachedStorage = null) {
	    let storage;

	    if (cachedStorage) {
	      storage = cachedStorage;
	    } else if (this.collectTypesOnInit) {
	      storage = typeCheckerLevelsStorage_4();
	      Object.keys(target).forEach(key => storage.addFor(key, this.getTypeValue(target[key]), target));
	    }

	    return storage;
	  }

	  getTypeValue(value) {
	    return getTypeValue(value);
	  }

	  checkType(action, storage, target, names, type) {
	    return checkPrimitiveType(action, storage, target, names, type);
	  }
	  /**
	   * FIXME add function to @actualwave/type-checker-levels-storage to merge configs
	   * this function should accept storages and merge strategy callback which will
	   * receive type info and decide what should be merged and what not
	   */


	  mergeConfigs(storage, sourceStorage, names) {
	    const errorReporter = getErrorReporter();
	    sourceStorage.copyTo(storage, null, (key, target, source) => {
	      const targetFirstValue = target.values().next().value;
	      source.forEach(sourceType => {
	        if (!target.has(sourceType)) {
	          target.add(sourceType);

	          if (targetFirstValue) {
	            errorReporter(MERGE, names, targetFirstValue, sourceType);
	          }
	        }
	      });
	      return target;
	    });
	  }

	  getProperty(target, names, value, storage) {
	    if (!this.enableGetChecker) {
	      return true;
	    }

	    const type = this.getTypeValue(value);
	    return this.checkType(GET_PROPERTY, storage, target, names, type);
	  }

	  setProperty(target, names, value, storage) {
	    const type = this.getTypeValue(value);
	    return this.checkType(SET_PROPERTY, storage, target, names, type);
	  }

	  arguments(target, names, args, storage) {
	    const {
	      length
	    } = args;
	    let valid = true;

	    for (let index = 0; index < length; index++) {
	      const type = this.getTypeValue(args[index]);
	      const agrValid = this.checkType(ARGUMENTS, storage, target, names.clone(index), type);
	      valid = agrValid && valid;
	    }

	    return valid;
	  }

	  returnValue(target, names, value, storage) {
	    const type = this.getTypeValue(value);
	    const callNames = names.clone();
	    callNames.appendCustomValue(RETURN_VALUE);
	    return this.checkType(RETURN_VALUE, storage, target, callNames, type);
	  }

	}

	const createPrimitiveTypeChecker = (collectTypesOnInit = true, enableGetChecker = true) => new PrimitiveTypeChecker(collectTypesOnInit, enableGetChecker);

	exports.MERGE = MERGE;
	exports.ARGUMENTS = ARGUMENTS;
	exports.GET_PROPERTY = GET_PROPERTY;
	exports.RETURN_VALUE = RETURN_VALUE;
	exports.SET_PROPERTY = SET_PROPERTY;
	exports.checkPrimitiveType = checkPrimitiveType;
	exports.getTypeValue = getTypeValue;
	exports.PrimitiveTypeChecker = PrimitiveTypeChecker;
	exports.createPrimitiveTypeChecker = createPrimitiveTypeChecker;
	exports.getErrorReporter = getErrorReporter;
	exports.setErrorReporter = setErrorReporter;
	exports.REPORT_ALL = typeCheckerLevelsStorage_1;
	exports.REPORT_NEVER = typeCheckerLevelsStorage_2;
	exports.REPORT_ONCE = typeCheckerLevelsStorage_3;
	exports.getGlobalReportingLevel = typeCheckerLevelsStorage_6;
	exports.setGlobalReportingLevel = typeCheckerLevelsStorage_7;
	exports.getReportingLevel = typeCheckerLevelsStorage_8;
	exports.setReportingLevel = typeCheckerLevelsStorage_9;

	Object.defineProperty(exports, '__esModule', { value: true });

})));
//# sourceMappingURL=primitive-type-checker.js.map
