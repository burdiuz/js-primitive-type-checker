import { ConsoleErrorReporter } from '@actualwave/type-checker-simple-reporting';

let errorReporter = ConsoleErrorReporter;

export const getErrorReporter = () => errorReporter;

export const setErrorReporter = (value) => {
  errorReporter = value;
};
