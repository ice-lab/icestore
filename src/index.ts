import Store from './store';
import { Store as Wrapper, State, Middleware } from './types';

export default class Icestore {
  /** Stores registered */
  private stores: {[namespace: string]: any} = {};

  /** Global middlewares applied to all stores */
  private globalMiddlewares: Middleware[] = [];

  /** middleware applied to single store */
  private middlewareMap: {[namespace: string]: Middleware[]} = {};

  /**
   * Register multiple stores
   * @param {object} models - multiple store's model
   * @return {object} hooks which bind the user defined model used for typescript infer
   */
  public registerStores<M>(models: M) {
    const stores: {[K in keyof M]?: Store} = {};

    function getModel<K extends keyof M>(namespace: K): Store {
      const store = stores[namespace];
      if (!store) {
        throw new Error(`Not found namespace: ${namespace}.`);
      }
      return store;
    }

    Object.keys(models).forEach((namespace) => {
      const model = models[namespace];
      if (stores[namespace]) {
        throw new Error(`Namespace have been used: ${namespace}.`);
      }
      const storeMiddlewares = this.middlewareMap[namespace] || [];
      const middlewares = this.globalMiddlewares.concat(storeMiddlewares);
      stores[namespace] = new Store(namespace, model, middlewares);
    });

    const useStore = <K extends keyof M>(namespace: K): Wrapper<M[K]> => {
      return getModel(namespace).useStore<Wrapper<M[K]>>();
    };
    const useStores = <K extends keyof M>(namespaces: K[]): {[K in keyof M]: Wrapper<M[K]>} => {
      let result: {[K in keyof M]: Wrapper<M[K]>};
      namespaces.forEach(namespace => {
        result[namespace] = useStore(namespace);
      });
      return result;
    };
    const getState = <K extends keyof M>(namespace: K): {[K1 in keyof State<M[K]>]?: State<M[K]>[K1]} => {
      return getModel(namespace).getState<State<M[K]>>();
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
  public applyMiddleware(middlewares: Middleware[], namespace?: string) {
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
  private getModel(namespace: string) {
    const store = this.stores[namespace];
    if (!store) {
      throw new Error(`Not found namespace: ${namespace}.`);
    }
    return store;
  }

  /**
   * @deprecated Register single store
   * @param {string} namespace - unique name of store
   * @param {object} model - store's model consists of state and actions
   * @return {object} store instance
   */
  public registerStore(namespace: string, model: {[namespace: string]: any}) {
    if (this.stores[namespace]) {
      throw new Error(`Namespace have been used: ${namespace}.`);
    }
    const storeMiddlewares = this.middlewareMap[namespace] || [];
    const middlewares = this.globalMiddlewares.concat(storeMiddlewares);
    this.stores[namespace] = new Store(namespace, model, middlewares);
    return this.stores[namespace];
  }

  /**
   * @deprecated Get state of store by namespace
   * @param {string} namespace - unique name of store
   * @return {object} store's state
   */
  public getState(namespace: string) {
    return this.getModel(namespace).getState();
  }

  /**
   * @deprecated Hook of using store
   * @param {string} namespace - unique name of store
   * @return {object} single store's config
   */
  public useStore(namespace: string) {
    return this.getModel(namespace).useStore();
  }

  /**
   * @deprecated Hook of using multiple stores
   * @param {string} namespace - unique name of store
   * @return {object} map of multiple store's config
   */
  public useStores(namespaces: string[]) {
    const result = {};
    namespaces.forEach(namespace => {
      result[namespace] = this.useStore(namespace);
    });
    return result;
  };
}

