import * as isFunction from 'lodash.isfunction';
import * as isPromise from 'is-promise';
import { useState, useEffect } from 'react';
import compose from './util/compose';
import { ComposeFunc, Middleware } from './interface';

export default class Store {
  /** Store state and actions user defined */
  private bindings: {[name: string]: any} = {};

  /** Queue of setState method from useState hook */
  private queue = [];

  /** Namespace of store */
  private namespace = '';

  /** Middleware queue of store */
  private middlewares = [];

  /** Flag of whether disable loading effect globally */
  public disableLoading = false;

  /**
   * Constuctor of Store
   * @param {string} namespace - unique name of store
   * @param {object} bindings - object of state and actions used to init store
   * @param {array} middlewares - middlewares queue of store
   */
  public constructor(namespace: string, bindings: object, middlewares: Middleware []) {
    this.namespace = namespace;
    this.middlewares = middlewares;

    Object.keys(bindings).forEach((key) => {
      const value = bindings[key];
      this.bindings[key] = isFunction(value) ? this.createAction(value, key) : value;
    });
  }

  /**
   * Create action which will trigger state update after mutation
   * @param {function} func - original method user defined
   * @param {string} actionName - name of action function
   * @return {function} action function
   */
  private createAction(func: () => any, actionName: string): ComposeFunc {
    const actionWrapper: any = async (...args) => {
      wrapper.loading = true;
      wrapper.error = null;

      const disableLoading = wrapper.disableLoading !== undefined
        ? wrapper.disableLoading : this.disableLoading;
      const result = func.apply(this.bindings, args);
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
    const wrapper: any = compose(this.middlewares.concat(actionMiddleware), ctx);

    return wrapper;
  }

  /**
   * Get state from bindings
   * @return {object} state
   */
  public getState = (): object => {
    const { bindings } = this;
    const state = {};
    Object.keys(bindings).forEach((key) => {
      const value = bindings[key];
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
   * Hook used to register setState and expose bindings
   * @return {object} bindings of store
   */
  public useStore(): object {
    const state = this.getState();
    const [, setState] = useState(state);
    useEffect(() => {
      this.queue.push(setState);
      return () => {
        const index = this.queue.indexOf(setState);
        this.queue.splice(index, 1);
      };
    }, []);
    return { ...this.bindings };
  }
}
