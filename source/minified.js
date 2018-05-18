/* eslint-disable import/no-extraneous-dependencies */
const typeCheckers = require('@actualwave/type-checkers');
const primitive = require('./index');

typeCheckers.setDefaultTypeChecker(new primitive.PrimitiveTypeChecker());

Object.assign(exports, primitive, typeCheckers);
