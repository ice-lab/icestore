import * as React from 'react';
import { SplitValueFunction, ContextHookReturn } from './types';

const isDev = process.env.NODE_ENV !== 'production';

const NO_PROVIDER = '_NP_' as any;

function createUseContainer(context: React.Context<any>): any {
  return () => {
    const value = React.useContext(context);
    if (isDev && value === NO_PROVIDER) {
      throw new Error('Component must be wrapped within a Provider.');
    }
    return value;
  };
}

function createContainer<P, V, S extends Array<SplitValueFunction<V>>>(
  useValue: (props?: P) => V,
  ...splitValues: S
): ContextHookReturn<P, V, S> {
  const Context = React.createContext(NO_PROVIDER as V);

  const Provider: React.FunctionComponent<P> = props => {
    const value = useValue(props);
    return (
      <Context.Provider value={value}>
        {props.children}
      </Context.Provider>
    );
  };

  if (isDev && useValue.name) {
    Context.displayName = `${useValue.name}.Context`;
    Provider.displayName = `${useValue.name}.Provider`;
  }

  const useContext: any = []
  const tuple = [] as any[];

  if (!splitValues.length) {
    tuple.push(Provider, createUseContainer(Context));
  } else {
    const contexts = [] as Array<React.Context<any>>;

    const SplitProvider: React.FunctionComponent<P> = props => {
      const value = useValue(props);
      let children = props.children as React.ReactElement;

      for (let i = 0; i < contexts.length; i += 1) {
        const context = contexts[i];
        // splitValue may be a hook, but it won't change between re-renders
        const splitValue = splitValues[i];
        children = (
          <context.Provider value={splitValue(value)}>
            {children}
          </context.Provider>
        );
      }

      return children;
    };

    if (isDev && useValue.name) {
      SplitProvider.displayName = `${useValue.name}.Provider`;
    }

    tuple.push(SplitProvider);

    for (let i = 0; i < splitValues.length; i += 1) {
      const context = React.createContext(NO_PROVIDER);
      contexts.push(context);
      tuple.push(createUseContainer(context));
    }
  }

  for (let i = 0; i < tuple.length; i += 1) {
    useContext[i] = tuple[i];
  }

  return useContext;
}

export default createContainer;
