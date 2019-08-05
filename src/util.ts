import * as isObject from 'lodash.isobject';
import * as forEach from 'lodash.foreach';

/**
 * Recursively add proxy to object
 * @param {object} value - value of object type
 * @param {object} handler - proxy handler
 * @return {object} new proxy object
 */
/* eslint no-param-reassign: 0 */
export function addProxy<T extends object>(value: T, handler: object): T {
  if (!value || Object.isFrozen(value)) {
    return value;
  }
  forEach(value, (item, key) => {
    if (isObject(item)) {
      value[key] = addProxy(item, handler);
    }
  });
  return new Proxy(value, handler);
}

/**
 * Convert proxied value to plain js object
 * @param {any} value - js value of any type
 * @return {any} plain js type
 */
export function toJS(value: any): any {
  if (!value || !isObject(value)) {
    return value;
  }

  const newValue = Array.isArray(value) ? [] : {};
  forEach(value, (item, key) => {
    if (isObject(item)) {
      newValue[key] = toJS(item);
    } else {
      newValue[key] = item;
    }
  });
  return newValue;
}
