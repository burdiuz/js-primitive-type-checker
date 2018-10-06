import {
  REPORT_ALL,
  REPORT_NEVER,
  REPORT_ONCE,
  getGlobalReportingLevel,
  setGlobalReportingLevel,
  getReportingLevel,
  setReportingLevel,
} from '@actualwave/type-checker-levels-storage';

import { getErrorReporter, setErrorReporter } from './error-reporter';

import {
  MERGE,
  ARGUMENTS,
  GET_PROPERTY,
  RETURN_VALUE,
  SET_PROPERTY,
  checkPrimitiveType,
  getTypeValue,
} from './utils';

import PrimitiveTypeChecker, { createPrimitiveTypeChecker } from './checker';

export {
  MERGE,
  ARGUMENTS,
  GET_PROPERTY,
  RETURN_VALUE,
  SET_PROPERTY,
  checkPrimitiveType,
  getTypeValue,
  PrimitiveTypeChecker,
  createPrimitiveTypeChecker,
  getErrorReporter,
  setErrorReporter,

  REPORT_ALL,
  REPORT_NEVER,
  REPORT_ONCE,
  getGlobalReportingLevel,
  setGlobalReportingLevel,
  getReportingLevel,
  setReportingLevel,
};

export default PrimitiveTypeChecker;
