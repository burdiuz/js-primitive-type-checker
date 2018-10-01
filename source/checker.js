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
} from './utils';

class PrimitiveTypeChecker {
  constructor(collectTypesOnInit = true) {
    this.collectTypesOnInit = collectTypesOnInit;
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
    if (value === undefined) {
      return '';
    }

    const type = typeof value;

    if (type === 'object' && value instanceof Array) {
      return 'array';
    }

    return type;
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
    const type = this.getTypeValue(value);

    /**
     * FIXME this function also stores new type information, so it must receive target
     * or reporting level to work properly
     * or callback to store new type value
     */
    return checkPrimitiveType(GET_PROPERTY, storage, target, names, type);
  }

  setProperty(target, names, value, storage) {
    const type = this.getTypeValue(value);

    return checkPrimitiveType(SET_PROPERTY, storage, target, names, type);
  }

  arguments(target, names, args, storage) {
    const { length } = args;
    let valid = true;

    for (let index = 0; index < length; index++) {
      const type = this.getTypeValue(args[index]);
      const agrValid = checkPrimitiveType(ARGUMENTS, storage, target, names.clone(index), type);

      valid = agrValid && valid;
    }

    return valid;
  }

  returnValue(target, names, value, storage) {
    const type = this.getTypeValue(value);

    const callNames = storage.clone();
    callNames.appendCustomValue(RETURN_VALUE);

    return checkPrimitiveType(RETURN_VALUE, storage, target, callNames, type);
  }
}

export const createPrimitiveTypeChecker = (collectTypesOnInit) =>
  new PrimitiveTypeChecker(collectTypesOnInit);

export default PrimitiveTypeChecker;