import Store from './store';
import { toJS, compose } from './util';

interface MethodFunc {
  (): void;
}

export default class Icestore {
  /** Stores registered */
  private stores: {[namespace: string]: Store} = {};

  private middlewares = [];

  /**
   * Register and init store
   * @param {string} namespace - unique name of store
   * @param {object} bindings - object of state and actions used to init store
   * @return {object} store instance
   */
  public registerStore(namespace: string, bindings: object): Store {
    if (this.stores[namespace]) {
      throw new Error(`Namespace have been used: ${namespace}.`);
    }

    this.stores[namespace] = new Store(bindings, namespace, this.middlewares);
    return this.stores[namespace];
  }

  public applyMiddleware(...middlewares): void {
    this.middlewares = middlewares;
  }

  /**
   * Find store by namespace
   * @param {string} namespace - unique name of store
   * @return {object} store instance
   */
  private getModel(namespace: string): Store {
    const store: Store = this.stores[namespace];
    if (!store) {
      throw new Error(`Not found namespace: ${namespace}.`);
    }
    return store;
  }

  /**
   * Hook of using store
   * @param {string} namespace - unique name of store
   * @return {object} store's bindings
   */
  public useStore(namespace: string): object {
    return this.getModel(namespace).useStore();
  }

  /**
   * Hook of using multiple stores
   * @param {string} namespace - unique name of store
   * @return {array} array of store's bindings
   */
  public useStores(namespaces: string[]): object[] {
    return namespaces.map(namespace => this.useStore(namespace));
  }
}

export { toJS };
