/* eslint-disable class-methods-use-this */
import { createTypesStorage } from '@actualwave/type-checker-levels-storage';

import { getErrorReporter } from './error-reporter';

import {
  MERGE,
  ARGUMENTS,
  GET_PROPERTY,
  RETURN_VALUE,
  SET_PROPERTY,
  checkPrimitiveType,
  getTypeValue,
} from './utils';

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
      storage = createTypesStorage();
      Object.keys(target).forEach((key) =>
        storage.addFor(key, this.getTypeValue(target[key]), target),
      );
    }

    return storage;
  }

  getTypeValue(value) {
    return getTypeValue(value);
  }

  checkValueType(action, storage, target, names, type) {
    if (!type) {
      return true;
    }

    const { lastName } = names;

    const compatible = this.isTypeCompatible(storage, lastName, type, target);

    if (!compatible) {
      const errorReporter = getErrorReporter();

      errorReporter(action, names.toString(), storage.list(lastName), type);
    }

    storage.addFor(lastName, type, target);

    return compatible;
  }

  isTypeCompatible(storage, key, type) {
    return checkPrimitiveType(storage, key, type);
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
    const { length } = args;
    let valid = true;

    for (let index = 0; index < length; index++) {
      const type = this.getTypeValue(args[index]);
      const agrValid = this.checkValueType(ARGUMENTS, storage, target, names.clone(index), type);

      valid = agrValid && valid;
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

export const createPrimitiveTypeChecker = (collectTypesOnInit = true, enableGetChecker = true) =>
  new PrimitiveTypeChecker(collectTypesOnInit, enableGetChecker);

export default PrimitiveTypeChecker;
