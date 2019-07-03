import * as isObject from 'lodash.isobject';
import * as forEach from 'lodash.foreach';

/**
 * Recursively add proxy to object
 * @param {object} value - value of object type
 * @param {object} handler - proxy handler
 * @return {object} new proxy object
 */
/* eslint no-param-reassign: 0, import/prefer-default-export: 0 */
export function addProxy(value: object, handler: object): any {
  forEach(value, (item, key) => {
    if (isObject(item)) {
      value[key] = addProxy(item, handler);
    }
  });
  return value && new Proxy(value, handler);
}
