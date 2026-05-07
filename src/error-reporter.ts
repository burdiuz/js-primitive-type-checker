import { Reporter, ConsoleErrorReporter } from '@actualwave/type-checker-simple-reporting';

export type { Reporter };

let errorReporter: Reporter = ConsoleErrorReporter;

export const getErrorReporter = (): Reporter => errorReporter;

export const setErrorReporter = (value: Reporter): void => {
  errorReporter = value;
};
