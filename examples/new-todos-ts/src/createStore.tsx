import React, { useState } from 'react';

export interface ContainerProviderProps<State = void> {
	initialState?: State
	children: React.ReactNode
}

export interface Container<Value, State = void> {
	Provider: React.ComponentType<ContainerProviderProps<State>>
	useContainer: () => Value
}

export function createContainer<Value, State = void>(
	useHook: (initialState?: State) => Value,
): Container<Value, State> {
	const Context = React.createContext<Value | null>(null)

	function Provider(props: ContainerProviderProps<State>) {
		const value = useHook(props.initialState)
		return <Context.Provider value={value}>{props.children}</Context.Provider>
	}

	function useContainer(): Value {
		const value = React.useContext(Context)
		if (value === null) {
			throw new Error("Component must be wrapped with <Container.Provider>")
		}
		return value
	}

	return { Provider, useContainer };
}

export function createStore(models) {
  const containers = {};
  Object.keys(models).forEach(namespace => {
    const { state, actions } = models[namespace];
    function useModel() {
      const [data, setData] = useState(state);
      const fns = {};
      Object.keys(actions).forEach((name) => {
        const fn = actions[name];
        fns[name] = (...args) => setData((preState) => fn(preState, ...args))
      });
      return { data, ...fns };
    }

    containers[namespace] = createContainer(useModel);
  });

  function Provider({ children }) {
    Object.keys(containers).forEach(namespace => {
      const { Provider: ModelProvider } = containers[namespace];
      children = <ModelProvider>{children}</ModelProvider>
    });
    return <>{children}</>
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
