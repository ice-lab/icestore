import Store from './store';
import toJS from './util/toJS';
import compose from './util/compose';

interface MethodFunc {
  (): void;
}

export default class Icestore {
  /** Stores registered */
  private stores: {[namespace: string]: Store} = {};

  /** Global middlewares applied to all stores */
  private globalMiddlewares = [];

  /** middleware applied to single store */
  private middlewaresMap = {};

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

    this.stores[namespace] = new Store(namespace, bindings, this.composeMiddleware.bind(this, namespace));
    return this.stores[namespace];
  }

  /**
   * Apply middleware to stores
   */
  public applyMiddleware(middlewares: (() => void)[], namespace: string): void {
    if (namespace !== undefined) {
      this.middlewaresMap[namespace] = middlewares;
    } else {
      this.globalMiddlewares = middlewares;
    }
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
   * Compose middlewares and action
   */
  private composeMiddleware(namespace: string, store: Store, action, actionName: string) {
    const storeMiddlewares = this.middlewaresMap[namespace] || [];
    const actionMiddleware = async (ctx, next) => {
      await action(...ctx.action.arguments);
    };
    const middlewares = this.globalMiddlewares
      .concat(storeMiddlewares)
      .concat(actionMiddleware);
    const ctx = {
      action: {
        name: actionName,
        arguments: [],
      },
      store: {
        namespace,
        getState: store.getState,
      },
    };

    return compose(middlewares, ctx);
  }

  /**
   * Get state of store by namespace
   * @param {string} namespace - unique name of store
   * @return {object} store's state
   */
  public getState(namespace: string): object {
    return this.getModel(namespace).getState();
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
