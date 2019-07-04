import * as isFunction from 'lodash.isfunction';
import * as isPromise from 'is-promise';
import * as isObject from 'lodash.isobject';
import { useState, useEffect } from 'react';
import { addProxy } from './util';

interface MethodFunc {
  (): void;
}

export default class Store {
  /** store state and actions user defined */
  private bindings: {[name: string]: any} = {};

  /** queue of setState method from useState hook */
  private queue = [];

  /** flag of whether allow state mutate */
  private allowMutate = false;

  /** flag of whether state changed after mutation */
  private stateChanged = false;

  /** flag of whether disable loading effect globally */
  public disableLoading = false;

  public constructor(bindings: object) {
    Object.keys(bindings).forEach((key) => {
      const value = bindings[key];
      this.bindings[key] = isFunction(value) ? this.createAction(value) : value;
    });

    const handler = {
      set: (target, prop, value) => {
        if (!this.allowMutate) {
          console.error('Forbid modifying state directly, use action to modify instead.');
          return false;
        }
        if (target[prop] !== value) {
          this.stateChanged = true;
        }
        /* eslint no-param-reassign: 0 */
        target[prop] = isObject(value) ? addProxy(value, handler) : value;
        return true;
      },
    };

    this.bindings = addProxy(this.bindings, handler);
  }

  /**
   * Create action which will trigger state update after mutation
   * @param {function} func - original method user defined
   * @return {function} action function
   */
  private createAction(func): MethodFunc {
    const wrapper: any = async (...args) => {
      this.allowMutate = true;

      const disableLoading = wrapper.disableLoading !== undefined
        ? wrapper.disableLoading : this.disableLoading;
      const result = func.apply(this.bindings, args);
      const isAsync = isPromise(result);
      const enableLoading = isAsync && !disableLoading;

      if (enableLoading) {
        wrapper.error = null;
        wrapper.loading = true;
        this.setState();
      }

      const afterExec = () => {
        wrapper.loading = false;
        if (enableLoading || this.stateChanged) {
          this.setState();
        }
        this.allowMutate = false;
        this.stateChanged = false;
      };

      try {
        await result;
        afterExec();
      } catch (e) {
        wrapper.error = e;
        afterExec();
        throw new Error(e);
      }

      return this.bindings;
    };

    return wrapper;
  }

  /**
   * Get state from bindings
   * @return {object} state
   */
  private getState(): object {
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
    return this.bindings;
  }
}
