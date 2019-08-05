import Store from './store';
import { toJS } from './util';

interface IceStore {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [namespace: string]: any;
}

export default class Icestore<T extends IceStore> {
  /** Stores registered */
  private stores: { [P in keyof T]: Store<T[P]> } = {} as { [P in keyof T]: Store<T[P]> }

  /**
   * Register and init store
   * @param {string} namespace - unique name of store
   * @param {object} bindings - object of state and actions used to init store
   * @return {object} store instance
   */
  public registerStore<P extends keyof T>(namespace: P, bindings: T[P]): Store<T[P]> {
    if (this.stores[namespace]) {
      throw new Error(`Namespace have been used: ${namespace}.`);
    }

    this.stores[namespace] = new Store(bindings);
    return this.stores[namespace];
  }

  /**
   * Find store by namespace
   * @param {string} namespace - unique name of store
   * @return {object} store instance
   */
  private getModel<P extends keyof T>(namespace: P): Store<T[P]> {
    const store = this.stores[namespace];
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
  public useStore<P extends keyof T>(namespace: P): T[P] {
    return this.getModel(namespace).useStore();
  }

  /**
   * Hook of using multiple stores
   * @param {string} namespace - unique name of store
   * @return {array} array of store's bindings
   */
  public useStores<P extends keyof T>(namespaces: P[]): T[P][] {
    return namespaces.map(namespace => this.useStore(namespace));
  }
}

export { toJS };
