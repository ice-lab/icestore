import React from 'react';
import { StoreOperater } from './operater';
import { Store, State, Middleware, Optionalize } from './types';

export class StoreManager {
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
    type Stores = {
      [K in keyof M]: Store<M[K]>
    };

    const storeOperaters: {[K in keyof M]?: StoreOperater} = {};
    Object.keys(models).forEach((namespace) => {
      const storeMiddlewares = this.middlewareMap[namespace] || [];
      const middlewares = this.globalMiddlewares.concat(storeMiddlewares);
      storeOperaters[namespace] = new StoreOperater(namespace, models[namespace], middlewares);
    });

    function getStore<K extends keyof M>(namespace: K): StoreOperater {
      const storeOperater = storeOperaters[namespace];
      if (!storeOperater) {
        throw new Error(`Not found namespace: ${namespace}.`);
      }
      return storeOperater;
    }
    function useStore<K extends keyof M>(namespace: K): Store<M[K]> {
      return getStore(namespace).useStore<Store<M[K]>>();
    }
    function useStores<K extends keyof M>(namespaces: K[]): Stores {
      const result: Partial<Stores> = {};
      namespaces.forEach(namespace => {
        result[namespace] = getStore(namespace).useStore<Store<M[K]>>();
      });
      return result as Stores;
    }
    function getState<K extends keyof M>(namespace: K): {[K1 in keyof State<M[K]>]?: State<M[K]>[K1]} {
      return getStore(namespace).getState<State<M[K]>>();
    }
    function withStore<K extends keyof M>(namespace: K, mapStoreToProps?: (store: Store<M[K]>) => { store: Store<M[K]>|object } ) {
      type StoreProps = ReturnType<typeof mapStoreToProps>;
      return <P extends StoreProps>(Component: React.ComponentClass<P>) => {
        return (props: Optionalize<P, StoreProps>): React.ReactElement => {
          const store: Store<M[K]> = useStore(namespace);
          const storeProps: StoreProps = mapStoreToProps ? mapStoreToProps(store) : {store};
          return (
            <Component
              {...storeProps}
              {...(props as P)}
            />
          );
        };
      };
    }
    function withStores<K extends keyof M>(namespaces: K[], mapStoresToProps?: (stores: Stores) => { stores: Stores|object }) {
      type StoresProps = ReturnType<typeof mapStoresToProps>;
      return <P extends StoresProps>(Component: React.ComponentType<P>) => {
        return (props: Optionalize<P, StoresProps>): React.ReactElement => {
          const stores: Stores = useStores(namespaces);
          const storesProps: StoresProps = mapStoresToProps ? mapStoresToProps(stores) : {stores};
          return (
            <Component
              {...storesProps}
              {...(props as P)}
            />
          );
        };
      };
    }

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
