import React, { useState } from 'react';

export interface ContainerProviderProps<State = void> {
  initialState?: State;
  children: React.ReactNode;
}

export interface Container<Value, State = void> {
  Provider: React.ComponentType<ContainerProviderProps<State>>;
  useContainer: () => Value;
}

export function createContainer<Value, State = void>(
  useHook: (initialState?: State) => Value,
): Container<Value, State> {
  const Context = React.createContext<Value | null>(null);

  function Provider(props: ContainerProviderProps<State>) {
    const value = useHook(props.initialState);
    return (
      <Context.Provider value={value}>
        {props.children}
      </Context.Provider>
    );
  }

  function useContainer(): Value {
    const value = React.useContext(Context);
    if (value === null) {
      throw new Error('Component must be wrapped with <Container.Provider>');
    }
    return value;
  }

  return { Provider, useContainer };
}

export function createStore(models) {
  const containers = {};
  Object.keys(models).forEach(namespace => {
    const { state, reducers, effects } = models[namespace];
    function useModel() {
      const [data, setData] = useState(state);
      const actions = {};
      Object.keys(reducers).forEach((name) => {
        const fn = reducers[name];
        actions[name] = (...args) => setData((prevState) => fn(prevState, ...args));
      });
      Object.keys(effects).forEach((name) => {
        const fn = effects[name];
        actions[name] = async (...args) => {
          await fn(actions, ...args);
        };
      });
      return { data, ...actions };
    }

    containers[namespace] = createContainer(useModel);
  });

  function Provider({ children }) {
    Object.keys(containers).forEach(namespace => {
      const { Provider: ModelProvider } = containers[namespace];
      children = <ModelProvider>{children}</ModelProvider>;
    });
    return <>{children}</>;
  }

  function useStore(namespace) {
    const { useContainer } = containers[namespace];
    return useContainer();
  }

  return {
    Provider,
    useStore,
  };
}
