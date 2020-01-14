import React from 'react';
import Store from './store';
import { Store as Wrapper, State, Middleware, Optionalize, EqualityFn, StoreOption } from './types';
import warning from './util/warning';
import shallowEqual from './util/shallowEqual';

export default class Icestore {
  /** Stores registered */
  private stores: {[namespace: string]: Store} = {};

  /** Global middlewares applied to all stores */
  private globalMiddlewares: Middleware[] = [];

  /** middleware applied to single store */
  private middlewareMap: {[namespace: string]: Middleware[]} = {};

  /** Global option applied to all stores */
  private globalOption: StoreOption = {};

  /** option applied to single store */
  private optionMap: {[namespace: string]: StoreOption} = {};

  /**
   * Register multiple stores
   * @param {object} models - multiple store's model
   * @return {object} hooks which bind the user defined model used for typescript infer
   */
  public registerStores<M extends object>(models: M) {
    const stores: {[K in keyof M]?: Store} = {};

    function getModel<K extends keyof M>(namespace: K): Store {
      const store = stores[namespace];
      if (!store) {
        throw new Error(`Not found namespace: ${namespace}.`);
      }
      return store;
    }

    Object.keys(models).forEach((namespace) => {
      const middlewares = this.getMiddlewares(namespace);
      const option = this.getOption(namespace);
      stores[namespace] = new Store(namespace, models[namespace], middlewares, option);
    });

    const useStore = <K extends keyof M>(namespace: K, equalityFn?: EqualityFn<Wrapper<M[K]>>): Wrapper<M[K]> => {
      return getModel(namespace).useStore<Wrapper<M[K]>>(equalityFn);
    };
    type Models = {
      [K in keyof M]: Wrapper<M[K]>
    };
    const useStores = <K extends keyof M>(namespaces: K[], equalityFnArr?: EqualityFn<Wrapper<M[K]>>[]): Models => {
      const result: Partial<Models> = {};
      namespaces.forEach((namespace, i) => {
        result[namespace] = getModel(namespace).useStore<Wrapper<M[K]>>(equalityFnArr && equalityFnArr[i]);
      });
      return result as Models;
    };
    const getState = <K extends keyof M>(namespace: K): {[K1 in keyof State<M[K]>]?: State<M[K]>[K1]} => {
      return getModel(namespace).getState<State<M[K]>>();
    };

    function withStore<K extends keyof M>(namespace: K, mapStoreToProps?: (store: Wrapper<M[K]>) => { store: Wrapper<M[K]>|object } ) {
      type StoreProps = ReturnType<typeof mapStoreToProps>;
      return <P extends StoreProps>(Component: React.ComponentClass<P>) => {
        return (props: Optionalize<P, StoreProps>): React.ReactElement => {
          const store: Wrapper<M[K]> = useStore(namespace);
          const storeProps: StoreProps = mapStoreToProps ? mapStoreToProps(store) : {store};
          return (
            <Component
              {...storeProps}
              {...(props as P)}
            />
          );
        };
      };
    };

    function withStores<K extends keyof M>(namespaces: K[], mapStoresToProps?: (stores: Models) => { stores: Models|object }) {
      type StoresProps = ReturnType<typeof mapStoresToProps>;
      return <P extends StoresProps>(Component: React.ComponentType<P>) => {
        return (props: Optionalize<P, StoresProps>): React.ReactElement => {
          const stores: Models = useStores(namespaces);
          const storesProps: StoresProps = mapStoresToProps ? mapStoresToProps(stores) : {stores};
          return (
            <Component
              {...storesProps}
              {...(props as P)}
            />
          );
        };
      };
    };

    return {
      useStore,
      useStores,
      getState,
      withStore,
      withStores,
    };
  }

  /**
   *  Get middlewares
   * @param namespace - unique name of store
   */
  private getMiddlewares(namespace?: string): Middleware[] {
    const storeMiddlewares = this.middlewareMap[namespace] || [];
    const middlewares = this.globalMiddlewares.concat(storeMiddlewares);
    return middlewares;
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
   * Get option for store
   * @param namespace - unique name of store
   */
  private getOption(namespace?: string): StoreOption {
    const storeOption = this.optionMap[namespace] || {};
    return {
      ...this.globalOption,
      ...storeOption,
    };
  }

  /**
   * Apply option to stores
   * @param {array} option - option of store
   * @param {string} namespace - unique name of store
   */
  public applyOption(option: StoreOption, namespace?: string) {
    if (namespace !== undefined) {
      this.optionMap[namespace] = option;
    } else {
      this.globalOption = option;
    }
  }

  /**
   * Find store by namespace
   * @deprecated
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
   * Register single store
   * @deprecated
   * @param {string} namespace - unique name of store
   * @param {object} model - store's model consists of state and actions
   * @return {object} store instance
   */
  public registerStore<T>(namespace: string, model: Wrapper<T>) {
    warning('Warning: Register store via registerStore API is deprecated and about to be removed in future version. Use the registerStores API instead. Refer to https://github.com/ice-lab/icestore#getting-started for example.');
    if (this.stores[namespace]) {
      throw new Error(`Namespace have been used: ${namespace}.`);
    }
    const middlewares = this.getMiddlewares(namespace);
    const option = this.getOption(namespace);
    this.stores[namespace] = new Store(namespace, model, middlewares, option);
    return this.stores[namespace];
  }

  /**
   * Get state of store by namespace
   * @deprecated
   * @param {string} namespace - unique name of store
   * @return {object} store's state
   */
  public getState(namespace: string) {
    warning('Warning: Get state via getState API is deprecated and about to be removed in future version. Use registerStores API to register stores and use getState from its return value instead. Refer to https://github.com/ice-lab/icestore#getting-started for example.');
    return this.getModel(namespace).getState();
  }

  /**
   * Hook of using store
   * @deprecated
   * @param {string} namespace - unique name of store
   * @return {object} single store's config
   */
  public useStore(namespace: string) {
    warning('Warning: Use store via useStore API is deprecated and about to be removed in future version. Please use registerStores API to register stores and use useStore from its return value instead. Refer to https://github.com/ice-lab/icestore#getting-started for example.');
    return this.getModel(namespace).useStore();
  }

  /**
   * Hook of using multiple stores
   * @deprecated
   * @param {string} namespace - unique name of store
   * @return {array} array of multiple store's config
   */
  public useStores(namespaces: string[]) {
    warning('Warning: Use stores via useStores API is deprecated and about to be removed in future version. Please use registerStores API to register stores and use useStores from its return value instead. Refer to https://github.com/ice-lab/icestore#getting-started for example.');
    return namespaces.map(namespace => this.useStore(namespace));
  };
}

export { shallowEqual };

