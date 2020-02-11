import React, { useState, useMemo } from 'react';
import { createContainer } from './createContainer';
import { Model } from './types';

const isDev = process.env.NODE_ENV !== 'production';

export function createStore(models: {[namespace: string]: Model}, preloadedStates?) {
  const containers = {};
  const modelActions = {};
  Object.keys(models).forEach(namespace => {
    const { state: defineState, reducers = [], effects = [] } = models[namespace];
    const preloadedState = preloadedStates && preloadedStates[namespace];
    modelActions[namespace] = {};

    function useModel() {
      const initialState = preloadedState || defineState;
      const [state, setState] = useState(initialState);

      const actions = useMemo(() => {
        const reducerActions = {};
        Object.keys(reducers).forEach((name) => {
          const fn = reducers[name];
          reducerActions[name] = (...args) => setState((prevState) => fn(prevState, ...args));
        });

        const effectActions = {};
        Object.keys(effects).forEach((name) => {
          const fn = effects[name];
          effectActions[name] = async (...args) => {
            await fn(...args, modelActions);
          };
        });
        return { ...reducerActions, ...effectActions };
      }, []);

      modelActions[namespace] = actions;

      return [state, actions];
    }

    if (isDev) {
      useModel.displayName = namespace;
    }

    containers[namespace] = createContainer(useModel, value => value[0], value => value[1]);
  });

  function Provider({ children }) {
    Object.keys(containers).forEach(namespace => {
      const [ ModelProvider ] = containers[namespace];
      children = <ModelProvider>{children}</ModelProvider>;
    });
    return <>{children}</>;
  }

  function useModelState(namespace: string) {
    const [, useModelState ] = containers[namespace];
    return useModelState();
  }

  function useModelAction(namespace: string) {
    const [, , useModelAction ] = containers[namespace];
    return useModelAction();
  }

  function useModel(namespace: string) {
    return [useModelState(namespace), useModelAction(namespace)];
  }

  function connect(namespace: string, mapStateToProps?, mapActionsToProps?) {
    return (Component) => {
      return (props): React.ReactElement => {
        const stateProps = mapStateToProps ? mapStateToProps(useModelState(namespace)) : {};
        const actionsProps = mapActionsToProps ? mapActionsToProps(useModelAction(namespace)) : {};
        return (
          <Component
            {...stateProps}
            {...actionsProps}
            {...props}
          />
        );
      };
    };
  }

  return {
    Provider,
    useModel,
    useModelState,
    useModelAction,
    connect,
  };
}
