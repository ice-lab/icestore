import Store from './store';
import { Stores, Store as Wrapper, State, Middleware } from './interface';

export default class Icestore<T extends Stores> {
  /** Stores registered */
  private stores: {[K in keyof T]?: Store<K>} = {};

  /** Global middlewares applied to all stores */
  private globalMiddlewares: Middleware[] = [];

  /** middleware applied to single store */
  private middlewareMap: {[K in keyof T]?: Middleware[]} = {};

  /**
   * Register single store
   * @param {string} namespace - unique name of store
   * @param {object} model - store's model consists of state and actions
   * @return {object} store instance
   */
  public registerStore<K extends keyof T, M>(namespace: K, model: M) {
    if (this.stores[namespace]) {
      throw new Error(`Namespace have been used: ${namespace}.`);
    }
    const storeMiddlewares = this.middlewareMap[namespace] || [];
    const middlewares = this.globalMiddlewares.concat(storeMiddlewares);
    this.stores[namespace] = new Store(namespace, model, middlewares);
    return this.stores[namespace];
  }

  /**
   * Register multiple stores
   * @param {object} models - multiple store's model
   * @return {object} hooks which bind the user defined model used for typescript infer
   */
  public registerStores<M extends T>(models: M) {
    Object.keys(models).forEach((namespace) => {
      this.registerStore(namespace, models[namespace]);
    });

    const useStore = <K extends keyof T>(namespace: K): Wrapper<M[K]> => {
      return this.getModel(namespace).useStore<Wrapper<M[K]>>();
    };
    const useStores = <K extends keyof T>(namespaces: K[]): {[K in keyof M]?: Wrapper<M[K]>} => {
      const result: {[K in keyof M]?: Wrapper<M[K]>} = {};
      namespaces.forEach(namespace => {
        result[namespace] = this.useStore(namespace);
      });
      return result;
    };
    const getState = <K extends keyof T>(namespace: K): {[K1 in keyof State<M[K]>]?: State<M[K]>[K1]} => {
      return this.getModel(namespace).getState<State<M[K]>>();
    };

    return {
      useStore,
      useStores,
      getState,
    };
  }

  /**
   * Apply middleware to stores
   * @param {array} middlewares - middlewares queue of store
   * @param {string} namespace - unique name of store
   */
  public applyMiddleware<K extends keyof T>(middlewares: Middleware[], namespace?: K): void {
    if (namespace !== undefined) {
      this.middlewareMap[namespace] = middlewares;
    } else {
      this.globalMiddlewares = middlewares;
    }
  }

  /**
   * Find store by namespace
   * @param {string} namespace - unique name of store
   * @return {object} store instance
   */
  private getModel<K extends keyof T>(namespace: K): Store<K> {
    const store = this.stores[namespace];
    if (!store) {
      throw new Error(`Not found namespace: ${namespace}.`);
    }
    return store;
  }

  /**
   * Get state of store by namespace
   * @param {string} namespace - unique name of store
   * @return {object} store's state
   */
  public getState<M, K extends keyof T = string>(namespace: K): {[K in keyof State<M>]?: State<M>[K]} {
    return this.getModel(namespace).getState<State<M>>();
  }

  /**
   * Hook of using store
   * @param {string} namespace - unique name of store
   * @return {object} single store's config
   */
  public useStore<M, K extends keyof T = string>(namespace: K): Wrapper<M> {
    return this.getModel(namespace).useStore<Wrapper<M>>();
  }

  /**
   * Hook of using multiple stores
   * @param {string} namespace - unique name of store
   * @return {object} map of multiple store's config
   */
  public useStores<M extends T, K extends keyof T = string>(namespaces: K[]): {[K in keyof M]?: Wrapper<M[K]>} {
    const result: {[K in keyof M]?: Wrapper<M[K]>} = {};
    namespaces.forEach(namespace => {
      result[namespace] = this.useStore(namespace);
    });
    return result;
  };
}

