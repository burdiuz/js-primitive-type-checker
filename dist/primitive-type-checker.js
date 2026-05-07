(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
    typeof define === 'function' && define.amd ? define(['exports'], factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.PrimitiveTypeChecker = {}));
})(this, (function (exports) { 'use strict';

    var typeCheckerLevelsStorage = {};

    var mapOfSets = {};

    var hasRequiredMapOfSets;

    function requireMapOfSets () {
    	if (hasRequiredMapOfSets) return mapOfSets;
    	hasRequiredMapOfSets = 1;

    	Object.defineProperty(mapOfSets, '__esModule', { value: true });

    	class MapOfSets {
    	    constructor() {
    	        this.storage = new Map();
    	    }
    	    has(key) {
    	        const values = this.storage.get(key);
    	        return !!values && values.size > 0;
    	    }
    	    hasValue(key, value) {
    	        const values = this.storage.get(key);
    	        return !!values && values.has(value);
    	    }
    	    get(key) {
    	        return this.storage.get(key);
    	    }
    	    list(key) {
    	        const values = this.storage.get(key);
    	        return values ? Array.from(values) : [];
    	    }
    	    forEach(callback) {
    	        this.storage.forEach((values, key) => values.forEach((value) => callback(value, key, this)));
    	    }
    	    eachValue(key, callback) {
    	        const values = this.storage.get(key);
    	        if (values) {
    	            values.forEach((value) => callback(value, key, this));
    	        }
    	    }
    	    add(key, value) {
    	        const values = this.storage.get(key);
    	        if (values) {
    	            values.add(value);
    	        }
    	        else {
    	            this.storage.set(key, new Set([value]));
    	        }
    	    }
    	    set(key, values) {
    	        const asSet = values instanceof Set ? values : new Set(values);
    	        if (asSet.size === 0) {
    	            this.remove(key);
    	            return;
    	        }
    	        this.storage.set(key, new Set(asSet));
    	    }
    	    remove(key) {
    	        this.storage.delete(key);
    	    }
    	    removeValue(key, value) {
    	        const values = this.storage.get(key);
    	        if (values) {
    	            values.delete(value);
    	            if (!values.size) {
    	                this.remove(key);
    	            }
    	        }
    	    }
    	    clone() {
    	        const target = new MapOfSets();
    	        this.storage.forEach((values, key) => target.set(key, new Set(values)));
    	        return target;
    	    }
    	}
    	const createMapOfSets = () => new MapOfSets();

    	mapOfSets.MapOfSets = MapOfSets;
    	mapOfSets.createMapOfSets = createMapOfSets;
    	mapOfSets.default = MapOfSets;
    	
    	return mapOfSets;
    }

    var hasRequiredTypeCheckerLevelsStorage;

    function requireTypeCheckerLevelsStorage () {
    	if (hasRequiredTypeCheckerLevelsStorage) return typeCheckerLevelsStorage;
    	hasRequiredTypeCheckerLevelsStorage = 1;

    	var _mapOfSets = requireMapOfSets();
    	var MapOfSets = _mapOfSets.default || _mapOfSets;

    	/** Disable type tracking entirely for this target/property. */
    	const REPORT_NEVER = 'never';
    	/** Track every type ever assigned — each new type triggers a violation report once. */
    	const REPORT_ALL_ASSIGNED_TYPES = 'all';
    	/** Track only the first observed type — every subsequent type mismatch triggers a report. */
    	const REPORT_FIRST_TYPE_ONLY = 'first';
    	// Symbol keys are used instead of string keys to avoid colliding with user-defined properties.
    	const REPORT_KEY = Symbol('type-checkers:report-level');
    	const PROPERTY_REPORT_KEY = Symbol('type-checkers:property-report-level');
    	let globalReportingLevel = REPORT_FIRST_TYPE_ONLY;
    	const validateReportingLevel = (level) => {
    	    switch (level) {
    	        case REPORT_NEVER:
    	        case REPORT_ALL_ASSIGNED_TYPES:
    	            return level;
    	        default:
    	            return REPORT_FIRST_TYPE_ONLY;
    	    }
    	};
    	const setGlobalReportingLevel = (level) => {
    	    globalReportingLevel = validateReportingLevel(level);
    	};
    	const getGlobalReportingLevel = () => globalReportingLevel;
    	const setTargetGeneralReportingLevel = (target, level) => {
    	    if (level) {
    	        target[REPORT_KEY] = validateReportingLevel(level);
    	    }
    	    else {
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
    	    const perPropLevels = target[PROPERTY_REPORT_KEY];
    	    if (perPropLevels && Object.hasOwn(perPropLevels, key)) {
    	        return perPropLevels[key];
    	    }
    	    return target[REPORT_KEY];
    	};
    	/**
    	 * Resolve the reporting level for a property on a target object.
    	 * Priority (highest to lowest): per-property on instance → object-level on instance
    	 * → per-property on constructor → object-level on constructor → global default.
    	 */
    	const getReportingLevel = (target, key) => {
    	    const t = target;
    	    let level = getTargetReportingLevel(t, key);
    	    if (!level) {
    	        level = getTargetReportingLevel(t.constructor, key);
    	    }
    	    return level !== null && level !== void 0 ? level : getGlobalReportingLevel();
    	};

    	/** Default merge strategy: union of both sets (source types are added to target). */
    	const defaultMergeStrategy = (key, target, source) => {
    	    source.forEach((type) => {
    	        if (!target.has(type)) {
    	            target.add(type);
    	        }
    	    });
    	    return target;
    	};
    	class TypeInfoStorage extends MapOfSets {
    	    // MapOfSets.has() returns `values && values.size` — truthy but not a real boolean.
    	    has(key) {
    	        return !!super.has(key);
    	    }
    	    /**
    	     * Record a type observation for a key according to the given reporting level.
    	     * - REPORT_ALL_ASSIGNED_TYPES: accumulate every distinct type into the Set.
    	     * - REPORT_FIRST_TYPE_ONLY: store the first type only; ignore subsequent calls.
    	     * - REPORT_NEVER: clear any stored types for the key.
    	     */
    	    add(key, type, level = REPORT_ALL_ASSIGNED_TYPES) {
    	        if (!type)
    	            return;
    	        switch (level) {
    	            case REPORT_NEVER:
    	                this.remove(key);
    	                break;
    	            case REPORT_ALL_ASSIGNED_TYPES:
    	                super.add(key, type);
    	                break;
    	            case REPORT_FIRST_TYPE_ONLY:
    	            default: {
    	                // Only write if the key is empty — subsequent types are intentionally discarded.
    	                const types = this.storage.get(key);
    	                if (!types || !types.size) {
    	                    this.storage.set(key, new Set([type]));
    	                }
    	                break;
    	            }
    	        }
    	    }
    	    /** Convenience wrapper: resolves the level from the target object before calling add(). */
    	    addFor(key, type, target) {
    	        this.add(key, type, getReportingLevel(target, key));
    	    }
    	    set(key, types, level) {
    	        if (!types || types.size === 0 || level === REPORT_NEVER) {
    	            this.remove(key);
    	            return;
    	        }
    	        super.set(key, types);
    	    }
    	    /** Convenience wrapper: resolves the level from the target object before calling set(). */
    	    setFor(key, types, target) {
    	        this.set(key, types, getReportingLevel(target, key));
    	    }
    	    clone() {
    	        const target = new TypeInfoStorage();
    	        this.storage.forEach((types, key) => target.set(key, new Set(types)));
    	        return target;
    	    }
    	    /**
    	     * Merge all entries from this storage into `storage`.
    	     * If `target` is provided its reporting levels are respected — keys marked
    	     * REPORT_NEVER on `target` are skipped entirely.
    	     * When both storages contain the same key, `mergeStrategy` decides the result.
    	     */
    	    copyTo(storage, target, mergeStrategy = defaultMergeStrategy) {
    	        this.storage.forEach((types, key) => {
    	            // When no target is given, validateReportingLevel(undefined) returns REPORT_FIRST_TYPE_ONLY.
    	            const level = validateReportingLevel(target && getReportingLevel(target, key));
    	            switch (level) {
    	                case REPORT_FIRST_TYPE_ONLY:
    	                case REPORT_ALL_ASSIGNED_TYPES:
    	                    if (storage.has(key)) {
    	                        storage.set(key, mergeStrategy(key, storage.get(key), types, level), level);
    	                    }
    	                    else {
    	                        storage.set(key, new Set(types), level);
    	                    }
    	                    break;
    	            }
    	        });
    	        return storage;
    	    }
    	}
    	const createTypesStorage = () => new TypeInfoStorage();

    	typeCheckerLevelsStorage.REPORT_ALL_ASSIGNED_TYPES = REPORT_ALL_ASSIGNED_TYPES;
    	typeCheckerLevelsStorage.REPORT_FIRST_TYPE_ONLY = REPORT_FIRST_TYPE_ONLY;
    	typeCheckerLevelsStorage.REPORT_NEVER = REPORT_NEVER;
    	typeCheckerLevelsStorage.createTypesStorage = createTypesStorage;
    	typeCheckerLevelsStorage.defaultMergeStrategy = defaultMergeStrategy;
    	typeCheckerLevelsStorage.getGlobalReportingLevel = getGlobalReportingLevel;
    	typeCheckerLevelsStorage.getReportingLevel = getReportingLevel;
    	typeCheckerLevelsStorage.setGlobalReportingLevel = setGlobalReportingLevel;
    	typeCheckerLevelsStorage.setReportingLevel = setReportingLevel;
    	
    	return typeCheckerLevelsStorage;
    }

    var typeCheckerLevelsStorageExports = requireTypeCheckerLevelsStorage();

    var typeCheckerSimpleReporting = {};

    var hasRequiredTypeCheckerSimpleReporting;

    function requireTypeCheckerSimpleReporting () {
    	if (hasRequiredTypeCheckerSimpleReporting) return typeCheckerSimpleReporting;
    	hasRequiredTypeCheckerSimpleReporting = 1;

    	const constructErrorString = (action, name, required, received) => `${action}Error on "${name}" instead of "${required}" received "${received}"`;

    	/* eslint-disable no-console */
    	const ConsoleErrorReporter = (action, name, requiredTypeString, actualTypeString) => {
    	    console.error(constructErrorString(action, name, requiredTypeString, actualTypeString));
    	};
    	const ConsoleWarnReporter = (action, name, requiredTypeString, actualTypeString) => {
    	    console.warn(constructErrorString(action, name, requiredTypeString, actualTypeString));
    	};

    	const ThrowErrorReporter = (action, name, requiredTypeString, actualTypeString) => {
    	    throw new Error(constructErrorString(action, name, requiredTypeString, actualTypeString));
    	};

    	typeCheckerSimpleReporting.ConsoleErrorReporter = ConsoleErrorReporter;
    	typeCheckerSimpleReporting.ConsoleWarnReporter = ConsoleWarnReporter;
    	typeCheckerSimpleReporting.ThrowErrorReporter = ThrowErrorReporter;
    	typeCheckerSimpleReporting.constructErrorString = constructErrorString;
    	
    	return typeCheckerSimpleReporting;
    }

    var typeCheckerSimpleReportingExports = requireTypeCheckerSimpleReporting();

    let errorReporter = typeCheckerSimpleReportingExports.ConsoleErrorReporter;
    const getErrorReporter = () => errorReporter;
    const setErrorReporter = (value) => {
        errorReporter = value;
    };

    const MERGE = '(Merge)';
    const GET_PROPERTY = '(GetProperty)';
    const SET_PROPERTY = '(SetProperty)';
    const ARGUMENTS = '(Arguments)';
    const RETURN_VALUE = '(ReturnValue)';
    const checkPrimitiveType = (storage, key, type) => !storage.has(key) || storage.hasValue(key, type);
    const getTypeValue = (value) => {
        if (value === undefined) {
            return '';
        }
        const type = typeof value;
        if (type === 'object' && value instanceof Array) {
            return 'array';
        }
        return type;
    };

    class PrimitiveTypeChecker {
        constructor(collectTypesOnInit = true, enableGetChecker = true) {
            this.collectTypesOnInit = collectTypesOnInit;
            this.enableGetChecker = enableGetChecker;
        }
        init(target, cachedStorage = null) {
            if (cachedStorage) {
                return cachedStorage;
            }
            if (this.collectTypesOnInit) {
                const storage = typeCheckerLevelsStorageExports.createTypesStorage();
                Object.keys(target).forEach((key) => storage.addFor(key, this.getTypeValue(target[key]), target));
                return storage;
            }
            return undefined;
        }
        getTypeValue(value) {
            return getTypeValue(value);
        }
        checkValueType(action, storage, target, names, type) {
            if (!type) {
                return true;
            }
            const { lastName } = names;
            const compatible = this.isTypeCompatible(storage, lastName, type);
            if (!compatible) {
                const errorReporter = getErrorReporter();
                errorReporter(action, names.toString(), storage.list(lastName).join(' | '), type);
            }
            storage.addFor(lastName, type, target);
            return compatible;
        }
        isTypeCompatible(storage, key, type) {
            return checkPrimitiveType(storage, key, type);
        }
        mergeConfigs(storage, sourceStorage, names) {
            const errorReporter = getErrorReporter();
            sourceStorage.copyTo(storage, null, (_key, target, source) => {
                const targetFirstValue = target.values().next().value;
                source.forEach((sourceType) => {
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
            return this.checkValueType(GET_PROPERTY, storage, target, names, type);
        }
        setProperty(target, names, value, storage) {
            const type = this.getTypeValue(value);
            return this.checkValueType(SET_PROPERTY, storage, target, names, type);
        }
        arguments(target, names, args, storage) {
            let valid = true;
            for (let index = 0; index < args.length; index++) {
                const type = this.getTypeValue(args[index]);
                const argValid = this.checkValueType(ARGUMENTS, storage, target, names.clone(index), type);
                valid = argValid && valid;
            }
            return valid;
        }
        returnValue(target, names, value, storage) {
            const type = this.getTypeValue(value);
            const callNames = names.clone();
            callNames.appendCustomValue(RETURN_VALUE);
            return this.checkValueType(RETURN_VALUE, storage, target, callNames, type);
        }
    }
    const createPrimitiveTypeChecker = (collectTypesOnInit = true, enableGetChecker = true) => new PrimitiveTypeChecker(collectTypesOnInit, enableGetChecker);

    exports.ARGUMENTS = ARGUMENTS;
    exports.GET_PROPERTY = GET_PROPERTY;
    exports.MERGE = MERGE;
    exports.PrimitiveTypeChecker = PrimitiveTypeChecker;
    exports.REPORT_ALL_ASSIGNED_TYPES = typeCheckerLevelsStorageExports.REPORT_ALL_ASSIGNED_TYPES;
    exports.REPORT_FIRST_TYPE_ONLY = typeCheckerLevelsStorageExports.REPORT_FIRST_TYPE_ONLY;
    exports.REPORT_NEVER = typeCheckerLevelsStorageExports.REPORT_NEVER;
    exports.RETURN_VALUE = RETURN_VALUE;
    exports.SET_PROPERTY = SET_PROPERTY;
    exports.checkPrimitiveType = checkPrimitiveType;
    exports.createPrimitiveTypeChecker = createPrimitiveTypeChecker;
    exports.getErrorReporter = getErrorReporter;
    exports.getGlobalReportingLevel = typeCheckerLevelsStorageExports.getGlobalReportingLevel;
    exports.getReportingLevel = typeCheckerLevelsStorageExports.getReportingLevel;
    exports.getTypeValue = getTypeValue;
    exports.setErrorReporter = setErrorReporter;
    exports.setGlobalReportingLevel = typeCheckerLevelsStorageExports.setGlobalReportingLevel;
    exports.setReportingLevel = typeCheckerLevelsStorageExports.setReportingLevel;

}));
//# sourceMappingURL=primitive-type-checker.js.map
