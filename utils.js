'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

const GET_PROPERTY = '(GetProperty)';
const SET_PROPERTY = '(SetProperty)';
const ARGUMENTS = '(Arguments)';
const RETURN_VALUE = '(ReturnValue)';

function AsIs(value) {
  if (this instanceof AsIs) {
    this.value = value;
  } else {
    return new AsIs(value);
  }
}

function asIs() {
  return this.value;
}

AsIs.prototype.toString = asIs;
AsIs.prototype.valueOf = asIs;
AsIs.prototype[Symbol.toPrimitive] = asIs;

const buildPath = sequence => sequence.reduce((str, name) => {
  if (name instanceof AsIs) {
    return `${str}${name}`;
  } else if (String(parseInt(name, 10)) === name) {
    return `${str}[${name}]`;
  } else if (/^[a-z][\w$]*$/i.test(name)) {
    return str ? `${str}.${name}` : name;
  }

  return `${str}["${name}"]`;
}, '');

exports.GET_PROPERTY = GET_PROPERTY;
exports.SET_PROPERTY = SET_PROPERTY;
exports.ARGUMENTS = ARGUMENTS;
exports.RETURN_VALUE = RETURN_VALUE;
exports.AsIs = AsIs;
exports.buildPath = buildPath;
//# sourceMappingURL=utils.js.map
