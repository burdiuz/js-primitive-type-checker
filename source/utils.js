export const GET_PROPERTY = '(GetProperty)';
export const SET_PROPERTY = '(SetProperty)';
export const ARGUMENTS = '(Arguments)';
export const RETURN_VALUE = '(ReturnValue)';

export function AsIs(value) {
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

export const buildPath = (sequence) =>
  sequence.reduce((str, name) => {
    if (name instanceof AsIs) {
      return `${str}${name}`;
    } else if (String(parseInt(name, 10)) === name) {
      return `${str}[${name}]`;
    } else if (/^[a-z][\w$]*$/i.test(name)) {
      return str ? `${str}.${name}` : name;
    }

    return `${str}["${name}"]`;
  }, '');
