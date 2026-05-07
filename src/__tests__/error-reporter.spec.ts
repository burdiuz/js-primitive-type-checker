import { describe, it, expect, beforeEach } from '@jest/globals';
import { ConsoleErrorReporter } from '@actualwave/type-checker-simple-reporting';
import { getErrorReporter, setErrorReporter } from '../error-reporter';

describe('error-reporter', () => {
  beforeEach(() => {
    setErrorReporter(ConsoleErrorReporter);
  });

  describe('getErrorReporter()', () => {
    it('returns the ConsoleErrorReporter by default', () => {
      expect(getErrorReporter()).toBe(ConsoleErrorReporter);
    });
  });

  describe('setErrorReporter()', () => {
    it('replaces the active reporter', () => {
      const custom = () => {};
      setErrorReporter(custom);
      expect(getErrorReporter()).toBe(custom);
    });
  });
});
