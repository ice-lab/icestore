import * as isFunction from 'lodash.isfunction';
import * as isPromise from 'is-promise';
import { useState, useEffect } from 'react';

interface MethodFunc {
  (): void;
}

export default class Store {
  /** Store state and actions user defined */
  private bindings: {[name: string]: any} = {};

  /** Queue of setState method from useState hook */
  private queue = [];

  /** Flag of whether disable loading effect globally */
  public disableLoading = false;

  public constructor(namespace: string, bindings: object, composeMiddleware) {
    Object.keys(bindings).forEach((key) => {
      const value = bindings[key];
      this.bindings[key] = isFunction(value) ? this.createAction(value, key, composeMiddleware) : value;
    });
  }

  /**
   * Create action which will trigger state update after mutation
   * @param {function} func - original method user defined
   * @param {string} actionType - action type
   * @param {function} composeMiddleware - middleware compose function
   * @return {function} action function
   */
  private createAction(func, actionType, composeMiddleware): MethodFunc {
    const wrapper: any = async (...args) => {
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
        await result;
        afterExec();
      } catch (e) {
        wrapper.error = e;
        afterExec();
        throw e;
      }
    };

    return composeMiddleware(this, wrapper, actionType);
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
    const newState = { ...state };
    this.queue.forEach(setState => setState(newState));
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
