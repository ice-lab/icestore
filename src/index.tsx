import React from 'react';
import Store from './store';
import { Store as Wrapper, State, Middleware, Optionalize } from './types';

export default class Icestore {
  /** Global middlewares applied to all stores */
  private globalMiddlewares: Middleware[] = [];

  /** middleware applied to single store */
  private middlewareMap: {[namespace: string]: Middleware[]} = {};

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
}

