import * as isObject from 'lodash.isobject';
import * as forEach from 'lodash.foreach';

/**
 * Recursively add proxy to object
 * @param {object} value - value of object type
 * @param {object} handler - proxy handler
 * @return {object} new proxy object
 */
/* eslint no-param-reassign: 0 */
export default function addProxy(value: object, handler: object): object {
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
