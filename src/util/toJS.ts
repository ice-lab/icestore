import * as isObject from 'lodash.isobject';
import * as forEach from 'lodash.foreach';

/**
 * Convert proxied value to plain js object
 * @param {any} value - js value of any type
 * @return {any} plain js type
 */
export default function toJS(value: any): any {
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
