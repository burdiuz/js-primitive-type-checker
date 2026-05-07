export {
  REPORT_FIRST_TYPE_ONLY,
  REPORT_NEVER,
  REPORT_ALL_ASSIGNED_TYPES,
  getGlobalReportingLevel,
  setGlobalReportingLevel,
  getReportingLevel,
  setReportingLevel,
} from '@actualwave/type-checker-levels-storage';

export { getErrorReporter, setErrorReporter } from './error-reporter';
export type { Reporter } from './error-reporter';

export {
  MERGE,
  ARGUMENTS,
  GET_PROPERTY,
  RETURN_VALUE,
  SET_PROPERTY,
  checkPrimitiveType,
  getTypeValue,
} from './utils';
export type { TypeStorage } from './utils';

export { createPrimitiveTypeChecker, default as PrimitiveTypeChecker } from './checker';
export type { PropertyNames } from './checker';
