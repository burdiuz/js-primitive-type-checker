import { createTypesStorage } from '@actualwave/type-checker-levels-storage';

import { getErrorReporter } from './error-reporter';

import {
  MERGE,
  ARGUMENTS,
  GET_PROPERTY,
  RETURN_VALUE,
  SET_PROPERTY,
  TypeStorage,
  checkPrimitiveType,
  getTypeValue,
} from './utils';

export interface PropertyNames {
  readonly lastName: string;
  toString(): string;
  clone(index?: number | string): PropertyNames;
  appendCustomValue(value: string): void;
}

class PrimitiveTypeChecker {
  collectTypesOnInit: boolean;
  enableGetChecker: boolean;

  constructor(collectTypesOnInit = true, enableGetChecker = true) {
    this.collectTypesOnInit = collectTypesOnInit;
    this.enableGetChecker = enableGetChecker;
  }

  init(target: object, cachedStorage: TypeStorage | null = null): TypeStorage | undefined {
    if (cachedStorage) {
      return cachedStorage;
    }

    if (this.collectTypesOnInit) {
      const storage = createTypesStorage<string, string>();
      Object.keys(target).forEach((key) =>
        storage.addFor(key, this.getTypeValue((target as Record<string, unknown>)[key]), target),
      );
      return storage;
    }

    return undefined;
  }

  getTypeValue(value: unknown): string {
    return getTypeValue(value);
  }

  checkValueType(
    action: string,
    storage: TypeStorage,
    target: object,
    names: PropertyNames,
    type: string,
  ): boolean {
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

  isTypeCompatible(storage: TypeStorage, key: string, type: string): boolean {
    return checkPrimitiveType(storage, key, type);
  }

  mergeConfigs(storage: TypeStorage, sourceStorage: TypeStorage, names: string): void {
    const errorReporter = getErrorReporter();

    sourceStorage.copyTo(storage, null as unknown as object, (_key: string, target: Set<string>, source: Set<string>) => {
      const targetFirstValue = target.values().next().value as string | undefined;

      source.forEach((sourceType: string) => {
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

  getProperty(target: object, names: PropertyNames, value: unknown, storage: TypeStorage): boolean {
    if (!this.enableGetChecker) {
      return true;
    }

    const type = this.getTypeValue(value);
    return this.checkValueType(GET_PROPERTY, storage, target, names, type);
  }

  setProperty(target: object, names: PropertyNames, value: unknown, storage: TypeStorage): boolean {
    const type = this.getTypeValue(value);
    return this.checkValueType(SET_PROPERTY, storage, target, names, type);
  }

  arguments(target: object, names: PropertyNames, args: unknown[], storage: TypeStorage): boolean {
    let valid = true;

    for (let index = 0; index < args.length; index++) {
      const type = this.getTypeValue(args[index]);
      const argValid = this.checkValueType(ARGUMENTS, storage, target, names.clone(index), type);
      valid = argValid && valid;
    }

    return valid;
  }

  returnValue(target: object, names: PropertyNames, value: unknown, storage: TypeStorage): boolean {
    const type = this.getTypeValue(value);
    const callNames = names.clone();
    callNames.appendCustomValue(RETURN_VALUE);
    return this.checkValueType(RETURN_VALUE, storage, target, callNames, type);
  }
}

export const createPrimitiveTypeChecker = (
  collectTypesOnInit = true,
  enableGetChecker = true,
): PrimitiveTypeChecker => new PrimitiveTypeChecker(collectTypesOnInit, enableGetChecker);

export default PrimitiveTypeChecker;
