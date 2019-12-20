import React, { FC } from 'react';
import Store from './store';
import { Store as Wrapper, State, Middleware } from './types';
import warning from './util/warning';

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
      const storeMiddlewares = this.middlewareMap[namespace] || [];
      const middlewares = this.globalMiddlewares.concat(storeMiddlewares);
      stores[namespace] = new Store(namespace, models[namespace], middlewares);
    });

    const useStore = <K extends keyof M>(namespace: K): Wrapper<M[K]> => {
      return getModel(namespace).useStore<Wrapper<M[K]>>();
    };
    type Models = {
      [K in keyof M]: Wrapper<M[K]>
    };
    const useStores = <K extends keyof M>(namespaces: K[]): Models => {
      const result: Partial<Models> = {};
      namespaces.forEach(namespace => {
        result[namespace] = getModel(namespace).useStore<Wrapper<M[K]>>();
      });
      return result as Models;
    };
    const getState = <K extends keyof M>(namespace: K): {[K1 in keyof State<M[K]>]?: State<M[K]>[K1]} => {
      return getModel(namespace).getState<State<M[K]>>();
    };

    function withStore<K extends keyof M>(namespace: K, mapStoreToProps: (store: Wrapper<M[K]>) => object) {
      return (Component) => {
        const StoreContainer: FC<any> = (props) => {
          const store = useStore(namespace);
          const storeProps = mapStoreToProps(store);
          return (
            <Component
              {...props}
              {...storeProps}
            />
          );
        };
        return StoreContainer as typeof Component;
      };
    };

    function withStores<K extends keyof M>(namespace: K[], mapStoreToProps: (store: Models) => object) {
      return (Component) => {
        const StoreContainer: FC<any> = (props) => {
          const stores = useStores(namespace);
          const storeProps = mapStoreToProps(stores);
          return (
            <Component
              {...props}
              {...storeProps}
            />
          );
        };
        return StoreContainer as typeof Component;
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
  public registerStore(namespace: string, model: {[namespace: string]: any}) {
    warning('Warning: Register store via registerStore API is deprecated and about to be removed in future version. Use the registerStores API instead. Refer to https://github.com/ice-lab/icestore#getting-started for example.');
    if (this.stores[namespace]) {
      throw new Error(`Namespace have been used: ${namespace}.`);
    }
    const storeMiddlewares = this.middlewareMap[namespace] || [];
    const middlewares = this.globalMiddlewares.concat(storeMiddlewares);
    this.stores[namespace] = new Store(namespace, model, middlewares);
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

