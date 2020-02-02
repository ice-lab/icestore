import isFunction from 'lodash.isfunction';
import isPromise from 'is-promise';
import { useState, useEffect } from 'react';
import { Ctx, Action, Middleware, EqualityFn, Queue, StoreOptions } from './types';

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

export class Wrapper {
  /** Store state and actions user defined */
  private store: any = {};

  /** Queue of setState method from useState hook */
  private queue: Queue<any>[] = [];

  /** Namespace of store */
  private namespace: string;

  /** Middleware queue of store */
  private middlewares = [];

  /** Flag of whether disable loading effect globally */
  private disableLoading = false;

  /**
   * Constuctor of Store
   * @param {string} namespace - unique name of store
   * @param {object} model - object of state and actions used to init store
   * @param {array} middlewares - middlewares queue of store
   */
  public constructor(namespace: string, model: object, middlewares: Middleware [], options?: StoreOptions) {
    this.namespace = namespace;
    this.middlewares = middlewares;
    if (options) {
      this.disableLoading = options.disableLoading;
    }

    Object.keys(model).forEach((key) => {
      const value = model[key];
      model[key] = isFunction(value) ? this.createAction(value, key) : value;
    });
    this.store = model;
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
   * Trigger setState method in queue
   */
  private setState(): void {
    const state = this.getState();

    this.queue.forEach(queueItem => {
      const { preState, setState, equalityFn } = queueItem;
      // update preState
      queueItem.preState = state;
      // use equalityFn check equality when function passed in
      if (equalityFn && equalityFn(preState, state)) {
        return;
      }
      setState(state);
    });
  }

  /**
   * Get state from store
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
   * Get store
   * @return {object} state
   */
  public getStore = <M>(): M => {
    return this.store;
  }

  /**
   * Hook used to register setState and expose store
   * @return {object} wrapper of store
   */
  public useStore<M>(equalityFn?: EqualityFn<M>): M {
    const state = this.getState();
    const [, setState] = useState(state);

    useEffect(() => {
      const queueItem = {
        preState: state,
        setState,
        equalityFn,
      };
      this.queue.push(queueItem);
      return () => {
        const index = this.queue.indexOf(queueItem);
        this.queue.splice(index, 1);
      };
    }, []);
    return { ...this.store };
  }
}
