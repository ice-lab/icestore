import isFunction from 'lodash.isfunction';
import isPromise from 'is-promise';
import { useState, useEffect } from 'react';
import { Ctx, Action, Middleware } from './types';

/**
 * Compose a middleware chain consisting of all the middlewares
 * @param {array} middlewares - middlewares user passed
 * @param {object} ctx - middleware context
 * @return {function} middleware chain
 */
export function compose(middlewares: Middleware[], ctx: Ctx): Action {
  return async (...args) => {
    ctx.action.arguments = args;

    function goNext(middleware, next) {
      return async () => {
        return await middleware(ctx, next);
      };
    }
    let next = async () => {
      Promise.resolve();
    };
    middlewares.slice().reverse().forEach((middleware) => {
      next = goNext(middleware, next);
    });

    return await next();
  };
}

export class StoreOperater {
  /** Store state and actions user defined */
  private store: any = {};

  /** Queue of setState method from useState hook */
  private queue = [];

  /** Namespace of store */
  private namespace: string;

  /** Middleware queue of store */
  private middlewares = [];

  /** Flag of whether disable loading effect globally */
  public disableLoading = false;

  /**
   * Constuctor of Store
   * @param {string} namespace - unique name of store
   * @param {object} model - object of state and actions used to init store
   * @param {array} middlewares - middlewares queue of store
   */
  public constructor(namespace: string, model: object, middlewares: Middleware []) {
    this.namespace = namespace;
    this.middlewares = middlewares;

    Object.keys(model).forEach((key) => {
      const value = model[key];
      this.store[key] = isFunction(value) ? this.createAction(value, key) : value;
    });
  }

  /**
   * Create action which will trigger state update after mutation
   * @param {function} func - original method user defined
   * @param {string} actionName - name of action function
   * @return {function} action function
   */
  private createAction(func: () => any, actionName: string): Action {
    const actionWrapper = async (...args) => {
      wrapper.loading = true;
      wrapper.error = null;

      const disableLoading = wrapper.disableLoading !== undefined
        ? wrapper.disableLoading : this.disableLoading;
      const result = func.apply(this.store, args);
      const isAsync = isPromise(result);
      const enableLoading = isAsync && !disableLoading;
      if (enableLoading) {
        this.setState();
      }

      const afterExec = () => {
        wrapper.loading = false;
        this.setState();
      };

      try {
        const value = await result;
        afterExec();
        return value;
      } catch (e) {
        wrapper.error = e;
        afterExec();
        throw e;
      }
    };

    const actionMiddleware = async (ctx, next) => {
      return await actionWrapper(...ctx.action.arguments);
    };
    const ctx = {
      action: {
        name: actionName,
        arguments: [],
      },
      store: {
        namespace: this.namespace,
        getState: this.getState,
      },
    };
    const wrapper = compose(this.middlewares.concat(actionMiddleware), ctx);

    return wrapper;
  }

  /**
   * Get state from model
   * @return {object} state
   */
  public getState <M>(): {[K in keyof M]?: M[K]} {
    const { store } = this;
    const state: {[K in keyof M]?: M[K]} = {};
    Object.keys(store).forEach((key) => {
      const value = store[key];
      if (!isFunction(value)) {
        state[key] = value;
      }
    });
    return state;
  }

  /**
   * Trigger setState method in queue
   */
  private setState(): void {
    const state = this.getState();
    this.queue.forEach(setState => setState(state));
  }

  /**
   * Hook used to register setState and expose model
   * @return {object} model of store
   */
  public useStore<M>(): M {
    const state = this.getState();
    const [, setState] = useState(state);
    useEffect(() => {
      this.queue.push(setState);
      return () => {
        const index = this.queue.indexOf(setState);
        this.queue.splice(index, 1);
      };
    }, []);
    return { ...this.store };
  }
}
