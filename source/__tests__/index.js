import {
  MERGE,
  GET_PROPERTY,
  SET_PROPERTY,
  RETURN_VALUE,
  ARGUMENTS,
} from '../utils';

import PrimitiveTypeChecker from '../index';

describe('PrimitiveTypeChecker', () => {
  let reporter;
  let target;
  let typeChecker;
  let config;

  beforeEach(() => {
    reporter = jest.fn();
    target = {
      numberValue: 123,
      stringValue: 'my string',
      booleanValue: true,
      objectValue: {},
      arrayValue: [],
    };
    typeChecker = new PrimitiveTypeChecker();
    config = typeChecker.init(target, reporter);
  });

  describe('init()', () => {
    describe('When "collectTypesOnInit" set to true', () => {
      let result;

      beforeEach(() => {
        typeChecker.collectTypesOnInit = true;
      });

      describe('When cached config passed', () => {
        beforeEach(() => {
          result = typeChecker.init({ value1: {} }, reporter, config.types);
        });

        it('should return proper config', () => {
          expect(result).toEqual({
            types: expect.any(Object),
            errorReporter: expect.any(Function),
          });
        });

        it('should store cached config AS IS', () => {
          expect(result.types).toBe(config.types);
        });
      });

      describe('When cached config not passed', () => {
        beforeEach(() => {
          result = typeChecker.init(target, reporter);
        });

        it('should return proper config', () => {
          expect(result).toEqual({
            types: {
              numberValue: 'number',
              stringValue: 'string',
              booleanValue: 'boolean',
              objectValue: 'object',
              arrayValue: 'array',
            },
            errorReporter: expect.any(Function),
          });
        });
      });
    });

    describe('When "collectTypesOnInit" set to false', () => {
      let result;

      beforeEach(() => {
        typeChecker.collectTypesOnInit = false;
      });

      describe('When cached config passed', () => {
        beforeEach(() => {
          result = typeChecker.init({ value1: {} }, reporter, config.types);
        });

        it('should return proper config', () => {
          expect(result).toEqual({
            types: expect.any(Object),
            errorReporter: expect.any(Function),
          });
        });

        it('should store cached config AS IS', () => {
          expect(result.types).toBe(config.types);
        });
      });

      describe('When cached config not passed', () => {
        beforeEach(() => {
          result = typeChecker.init(target, reporter);
        });

        it('should return proper config', () => {
          expect(result).toEqual({
            types: {},
            errorReporter: expect.any(Function),
          });
        });
      });
    });
  });

  describe('getTypeString()', () => {
    it('should return type string for Number', () => {
      expect(typeChecker.getTypeString(123)).toBe('number');
    });

    it('should return type string for String', () => {
      expect(typeChecker.getTypeString('str')).toBe('string');
    });

    it('should return type string for Boolean', () => {
      expect(typeChecker.getTypeString(false)).toBe('boolean');
    });

    it('should return type string for Object', () => {
      expect(typeChecker.getTypeString({})).toBe('object');
    });

    it('should return type string for Array', () => {
      expect(typeChecker.getTypeString([])).toBe('array');
    });
  });

  describe('mergeConfigs()', () => {
    let result;

    describe('When same error reporter used', () => {
      beforeEach(() => {
        result = typeChecker.mergeConfigs(
          typeChecker.init(
            {
              value1: 123,
              value2: 'my string',
              value3: true,
            },
            reporter,
          ),
          config,
        );
      });

      it('should generate new config', () => {
        expect(result).toEqual({
          types: {
            numberValue: 'number',
            stringValue: 'string',
            booleanValue: 'boolean',
            objectValue: 'object',
            arrayValue: 'array',
            value1: 'number',
            value2: 'string',
            value3: 'boolean',
          },
          errorReporter: expect.any(Function),
        });
      });
    });

    describe('When merge conflicts exist', () => {
      beforeEach(() => {
        result = typeChecker.mergeConfigs(
          typeChecker.init(
            {
              booleanValue: 123,
              numberValue: 'my string',
              stringValue: true,
            },
            reporter,
          ),
          config,
        );
      });

      it('should call error reporter with MERGE error', () => {
        expect(reporter).toHaveBeenCalledTimes(3);
        expect(reporter).toHaveBeenCalledWith(
          MERGE,
          'numberValue',
          'string',
          'number',
        );
        expect(reporter).toHaveBeenCalledWith(
          MERGE,
          'stringValue',
          'boolean',
          'string',
        );
        expect(reporter).toHaveBeenCalledWith(
          MERGE,
          'booleanValue',
          'number',
          'boolean',
        );
      });

      it('should generate new config', () => {
        expect(result).toEqual({
          types: {
            numberValue: 'string',
            stringValue: 'boolean',
            booleanValue: 'number',
            objectValue: 'object',
            arrayValue: 'array',
          },
          errorReporter: expect.any(Function),
        });
      });
    });
  });

  describe('getProperty()', () => {
    describe('When value of valid type', () => {
      beforeEach(() => {
        typeChecker.getProperty(target, 'stringValue', '123', config, []);
        typeChecker.getProperty(target, 'numberValue', 0, config, [
          'parent',
          'target',
        ]);
      });

      it('should not report any errors', () => {
        expect(reporter).not.toHaveBeenCalled();
      });
    });

    describe('When value of invalid type', () => {
      beforeEach(() => {
        typeChecker.getProperty(target, 'stringValue', 123, config, []);
        typeChecker.getProperty(target, 'booleanValue', 0, config, [
          'parent',
          'target',
        ]);
      });

      it('should not report any errors', () => {
        expect(reporter).toHaveBeenCalledTimes(2);
        expect(reporter).toHaveBeenCalledWith(
          GET_PROPERTY,
          'stringValue',
          'string',
          'number',
        );
        expect(reporter).toHaveBeenCalledWith(
          GET_PROPERTY,
          'parent.target.booleanValue',
          'boolean',
          'number',
        );
      });
    });
  });

  describe('setProperty()', () => {
    describe('When value of valid type', () => {
      beforeEach(() => {
        typeChecker.setProperty(target, 'stringValue', '123', config, []);
        typeChecker.setProperty(target, 'numberValue', 0, config, [
          'parent',
          'target',
        ]);
      });

      it('should not report any errors', () => {
        expect(reporter).not.toHaveBeenCalled();
      });
    });

    describe('When value of invalid type', () => {
      beforeEach(() => {
        typeChecker.setProperty(target, 'booleanValue', '', config, []);
        typeChecker.setProperty(target, 'numberValue', '123', config, [
          'parent',
          'target',
        ]);
      });

      it('should not report any errors', () => {
        expect(reporter).toHaveBeenCalledTimes(2);
        expect(reporter).toHaveBeenCalledWith(
          SET_PROPERTY,
          'booleanValue',
          'boolean',
          'string',
        );
        expect(reporter).toHaveBeenCalledWith(
          SET_PROPERTY,
          'parent.target.numberValue',
          'number',
          'string',
        );
      });
    });
  });

  describe('arguments()', () => {
    describe('When value of valid type', () => {
      beforeEach(() => {
        // init
        typeChecker.arguments(target, target, [false, 0, ''], config, []);
        // check
        typeChecker.arguments(target, target, [true, 1, 'abc'], config, []);
        typeChecker.arguments(target, target, [false, -1, ''], config, [
          'parent',
          'target',
        ]);
      });

      it('should not report any errors', () => {
        expect(reporter).not.toHaveBeenCalled();
      });
    });

    describe('When value of invalid type', () => {
      beforeEach(() => {
        // init
        typeChecker.arguments(target, target, [false, 0, ''], config, []);
        // check
        typeChecker.arguments(
          target,
          target,
          [true, '0', 'my string'],
          config,
          [],
        );
        typeChecker.arguments(target, target, ['', 1, null], config, [
          'parent',
          'target',
        ]);
      });

      it('should not report any errors', () => {
        expect(reporter).toHaveBeenCalledTimes(3);
        expect(reporter).toHaveBeenCalledWith(
          ARGUMENTS,
          '[1]',
          'number',
          'string',
        );
        expect(reporter).toHaveBeenCalledWith(
          ARGUMENTS,
          'parent.target[0]',
          'boolean',
          'string',
        );
        expect(reporter).toHaveBeenCalledWith(
          ARGUMENTS,
          'parent.target[2]',
          'string',
          'object',
        );
      });
    });
  });

  describe('returnValue()', () => {
    describe('When value of valid type', () => {
      beforeEach(() => {
        // init
        typeChecker.returnValue(target, target, 'my string', config, []);
        // checks
        typeChecker.returnValue(target, target, '', config, []);
        typeChecker.returnValue(target, target, '123', config, [
          'parent',
          'target',
        ]);
      });

      it('should not report any errors', () => {
        expect(reporter).not.toHaveBeenCalled();
      });
    });

    describe('When value of invalid type', () => {
      beforeEach(() => {
        // init
        typeChecker.returnValue(target, target, false, config, []);
        // checks
        typeChecker.returnValue(target, target, 0, config, []);
        typeChecker.returnValue(target, target, '', config, [
          'parent',
          'target',
        ]);
      });

      it('should not report any errors', () => {
        expect(reporter).toHaveBeenCalledTimes(2);
        expect(reporter).toHaveBeenCalledWith(
          RETURN_VALUE,
          RETURN_VALUE,
          'boolean',
          'number',
        );
        expect(reporter).toHaveBeenCalledWith(
          RETURN_VALUE,
          `parent.target${RETURN_VALUE}`,
          'boolean',
          'string',
        );
      });
    });
  });
});
