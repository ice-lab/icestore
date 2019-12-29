import React from 'react';
import { Wrapper } from './wrapper';
import { Model, State, Middleware, Optionalize } from './types';

export default function createStore<M extends object>(models: M, middlewares?: Middleware[]) {
  type Models = {
    [K in keyof M]: Model<M[K]>
  };

  const wrappers: {[K in keyof M]?: Wrapper} = {};
  Object.keys(models).forEach((namespace) => {
    wrappers[namespace] = new Wrapper(namespace, models[namespace], middlewares);
  });

  function getWrapper<K extends keyof M>(namespace: K): Wrapper {
    const wrapper = wrappers[namespace];
    if (!wrapper) {
      throw new Error(`Not found namespace: ${namespace}.`);
    }
    return wrapper;
  }
  function useStore<K extends keyof M>(namespace: K): Model<M[K]> {
    return getWrapper(namespace).useStore<Model<M[K]>>();
  }
  function useStores<K extends keyof M>(namespaces: K[]): Models {
    const result: Partial<Models> = {};
    namespaces.forEach(namespace => {
      result[namespace] = getWrapper(namespace).useStore<Model<M[K]>>();
    });
    return result as Models;
  }
  function getState<K extends keyof M>(namespace: K): {[K1 in keyof State<M[K]>]?: State<M[K]>[K1]} {
    return getWrapper(namespace).getState<State<M[K]>>();
  }
  function withStore<K extends keyof M>(namespace: K, mapStoreToProps?: (store: Model<M[K]>) => { store: Model<M[K]>|object } ) {
    type StoreProps = ReturnType<typeof mapStoreToProps>;
    return <P extends StoreProps>(Component: React.ComponentClass<P>) => {
      return (props: Optionalize<P, StoreProps>): React.ReactElement => {
        const store: Model<M[K]> = useStore(namespace);
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
  }

  return {
    useStore,
    useStores,
    getState,
    withStore,
    withStores,
  };
}
