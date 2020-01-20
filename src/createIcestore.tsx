import React from 'react';
import { Wrapper } from './wrapper';
import { Store, State, Middleware, Optionalize, Models, StoreOptions } from './types';

interface Config {
  options?: StoreOptions;
  middlewares?: Middleware[];
}

function createIcestore(models: Models, config?: Config);
function createIcestore(models, config) {
  const { middlewares, options } = config || {};
  type Stores = {
    [K in keyof Models]: Store<Models[K]>
  };

  const wrappers: {[K in keyof Models]?: Wrapper} = {};
  Object.keys(models).forEach((namespace) => {
    wrappers[namespace] = new Wrapper(namespace, models[namespace], middlewares, options);
  });
  function getWrapper<K extends keyof Models>(namespace: K): Wrapper {
    const wrapper = wrappers[namespace];
    if (!wrapper) {
      throw new Error(`Not found namespace: ${namespace}.`);
    }
    return wrapper;
  }
  function getStore<K extends keyof Models>(namespace: K): Store<Models[K]> {
    const store = getWrapper(namespace);
    return store.getStore<Store<Models[K]>>();
  }
  function useStore<K extends keyof Models>(namespace: K): Store<Models[K]> {
    return getWrapper(namespace).useStore<Store<Models[K]>>();
  }
  function useStores<K extends keyof Models>(namespaces: K[]): Stores {
    const result: Partial<Stores> = {};
    namespaces.forEach(namespace => {
      result[namespace] = getWrapper(namespace).useStore<Store<Models[K]>>();
    });
    return result as Stores;
  }
  function getState<K extends keyof Models>(namespace: K): {[K1 in keyof State<Models[K]>]?: State<Models[K]>[K1]} {
    return getWrapper(namespace).getState<State<Models[K]>>();
  }
  function withStore<K extends keyof Models>(namespace: K, mapStoreToProps?: (store: Store<Models[K]>) => { store: Store<Models[K]>|object } ) {
    type StoreProps = ReturnType<typeof mapStoreToProps>;
    return <P extends StoreProps>(Component: React.ComponentClass<P>) => {
      return (props: Optionalize<P, StoreProps>): React.ReactElement => {
        const store: Store<Models[K]> = useStore(namespace);
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
  function withStores<K extends keyof Models>(namespaces: K[], mapStoresToProps?: (stores: Stores) => { stores: Stores|object }) {
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
    getStore,
  };
}

export default createIcestore;
