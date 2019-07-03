import * as isObject from 'lodash.isobject';
import * as isFunction from 'lodash.isfunction';

const { isArray } = Array;

/**
 * Recursively add proxy to object and array
 * @param {*} value - variable of any type
 * @param {object} handler - proxy handler
 * @return {object} new proxy object
 */
/* eslint no-param-reassign: 0, import/prefer-default-export: 0 */
export function addProxy(value: object, handler: object): any {
  // null and function also belongs to object type
  if (value === null || isFunction(value)) {
    return value;
  }

  if (isArray(value)) { // array type
    value.forEach((item, index) => {
      if (isObject(item)) { // object and array type
        value[index] = addProxy(item, handler);
      }
    });
  } else if (isObject(value)) { // object type
    Object.keys(value).forEach((key) => {
      if (isObject(value[key])) { // object and array type
        value[key] = addProxy(value[key], handler);
      }
    });
  }
  return new Proxy(value, handler);
}
