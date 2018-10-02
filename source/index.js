/* eslint-disable class-methods-use-this */
import { getErrorReporter, setErrorReporter } from './error-reporter';

import {
  MERGE,
  ARGUMENTS,
  GET_PROPERTY,
  RETURN_VALUE,
  SET_PROPERTY,
  checkPrimitiveType,
} from './utils';

import PrimitiveTypeChecker, { createPrimitiveTypeChecker } from './checker';

export {
  MERGE,
  ARGUMENTS,
  GET_PROPERTY,
  RETURN_VALUE,
  SET_PROPERTY,
  checkPrimitiveType,
  PrimitiveTypeChecker,
  createPrimitiveTypeChecker,
  getErrorReporter,
  setErrorReporter,
};
