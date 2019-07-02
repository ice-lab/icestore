import * as isObject from 'lodash.isobject';
import * as isFunction from 'lodash.isfunction';

const isArray = Array.isArray;

/**
 * Recursively add proxy to javascipt variable
 * @param {*} value - javascript variable of any type
 * @param {func} handler - proxy handler
 * @return {object} new proxy object
 */
export const addProxy = (value, handler) => {
  if (!isObject(value) || isFunction(value)) {
    return value;
  }

  if (isArray(value)) {
    value.forEach((item, index) => {
      if (isObject(item)) {
        value[index] = addProxy(item, handler);
      }
    });
  } else if (isObject(value)) {
    Object.keys(value).forEach((key) => {
      if (isObject(value[key])) {
        value[key] = addProxy(value[key], handler);
      }
    });
  }
  return new Proxy(value, handler);
};
