const isFunction = require('lodash.isfunction');

interface IAction {
  type: string, 
  payload?: any[], 
  loading?: boolean
}

const isPromise = (fn) => {
  if (fn instanceof Promise) {
    return true;
  }
  if (typeof fn === 'object' && typeof fn.then === 'function') {
    return true;
  }
  return false;
};

export default class Store {
  private state: {[name: string]: any} = {};

  private originalMethods = {};

  private methods = {};

  private queue = [];

  constructor(bindings: object, private react) {
    for (const key in bindings) {
      const value = bindings[key];

      if (isFunction(value)) {
        this.originalMethods[key] = value;
        this.methods[key] = this.createMethod(key);
      } else {
        this.state[key] = value;
      }
    }
  } 

  private createMethod(type: string) {
    const method = (...args) => {
      this.dispatch({ type, payload: args });
      if (method.loading) {
        method.promise
          .then(payload => this.dispatch({ type, payload, loading: false }))
          .catch(() => this.dispatch({ type, loading: false }));
        return method.promise;
      }
      return this.state;
    };
    method.loading = false;
    method.promise = null;

    return method;
  }

  private dispatch(action: IAction): void {
    const newState = { ...this.state, ...this.getNextState(action) };
    if (!this.shouldUpdate(newState)) {
      return;
    }

    this.state = newState;
    const queue = [].concat(this.queue);
    this.queue = [];
    queue.forEach(setState => setState(newState));
  }

  private getNextState(action: IAction) {
    const { type, payload = {}, loading } = action;
    const originalMethod = this.originalMethods[type];
    const method = this.methods[type];

    if (!originalMethod) {
      return this.state;
    }

    if (loading === false && method.loading) {
      method.loading = false;
      return payload;
    }

    const newState = {...this.state};
    const result = originalMethod.apply(newState, payload);
    if (!isPromise(result)) {
      return newState;
    }

    method.loading = true;
    method.promise = result;

    return this.state;
  }

  // TODO
  private shouldUpdate(newState): boolean {
    return true;
  }

  public useStroe() {
    const [, setState] = this.react.useState();
    this.react.useEffect(() => {
      const index = this.queue.length;
      this.queue.push(setState);
      return () => {
        this.queue.splice(index, 1);
      };
    });

    return { ...this.state, ...this.methods };
  }
}