import * as isObject from 'lodash.isobject';
import * as forEach from 'lodash.foreach';

interface ComposeFunc {
  (): void;
}

/**
 * Compose a middleware chain consisting of all the middlewares
 * @param {array} middlewares - middlewares user passed
 * @param {object} store - middleware API
 * @param {string} actionType - type of action
 * @return {function} middleware chain
 */
export function compose(middlewares: (() => void)[], store: object, actionType: string): ComposeFunc {
  return async (...args) => {
    function goNext(middleware, next) {
      return async (...args) => {
        await middleware(store, next)(actionType, ...args);
      };
    }
    let next = async () => {
      Promise.resolve();
    };
    middlewares.slice().reverse().forEach((middleware) => {
      next = goNext(middleware, next);
    });
    try {
      await next(...args);
    } catch (e) {
      console.error(e);
    }
  };
}
