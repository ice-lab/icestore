import React from 'react';
import { createModel } from './createModel';
import {
  ModelConfigs,
  TModel,
  TModelConfigState,
  TModelActions,
  TModelActionsState,
} from './types';

export function createStore<C extends ModelConfigs>(configs: C) {
  function getModel<K extends keyof C>(namespace: K): TModel<C[K]> {
    const model = models[namespace];
    if (!model) {
      throw new Error(`Not found model by namespace: ${namespace}.`);
    }
    return model;
  }

  function Provider({ children, initialStates = {} }) {
    Object.keys(models).forEach((namespace) => {
      const [ ModelProvider ] = getModel(namespace);
      children = <ModelProvider initialState={initialStates[namespace]}>
        {children}
      </ModelProvider>;
    });
    return <>{children}</>;
  }

  function useModelState<K extends keyof C>(namespace: K): TModelConfigState<C[K]> {
    const [, useModelState ] = getModel(namespace);
    return useModelState();
  }

  function useModelActions<K extends keyof C>(namespace: K): TModelActions<C[K]> {
    const [, , useModelActions ] = getModel(namespace);
    return useModelActions();
  }

  function useModelActionsState<K extends keyof C>(namespace: K): TModelActionsState<C[K]> {
    const [, , , useModelActionsState ] = getModel(namespace);
    return useModelActionsState();
  }

  function useModel<K extends keyof C>(namespace: K): [TModelConfigState<C[K]>, TModelActions<C[K]>] {
    return [ useModelState(namespace), useModelActions(namespace) ];
  }

  function createWithUse(useFun) {
    const fnName = useFun.name;
    return function withModel(namespace, mapDataToProps?) {
      const propName = fnName === useModel.name ? namespace : `${namespace}${fnName.slice(8)}`;
      return (Component) => {
        return (props): React.ReactElement => {
          const model = useFun(namespace);
          const modelProps = mapDataToProps ? mapDataToProps(model) : { [propName]: model };
          return (
            <Component
              {...modelProps}
              {...props}
            />
          );
        };
      };
    };
  }

  function withModel<K extends keyof C>(namespace: K, mapModelToProps?) {
    return createWithUse(useModel)(namespace, mapModelToProps);
  }

  function withModelActions<K extends keyof C>(namespace: K, mapModelActionsToProps?) {
    return createWithUse(useModelActions)(namespace, mapModelActionsToProps);
  }

  function withModelActionsState<K extends keyof C>(namespace?: K, mapModelActionsStateToProps?) {
    return createWithUse(useModelActionsState)(namespace, mapModelActionsStateToProps);
  }

  const modelsActions = {};
  const models: { [K in keyof C]?: TModel<C[K]> } = {};
  Object.keys(configs).map(namespace => {
    const config = configs[namespace];
    models[namespace as (keyof C)] = createModel(config, namespace, modelsActions);
  });

  return {
    Provider,
    useModel,
    useModelActions,
    useModelActionsState,
    withModel,
    withModelActions,
    withModelActionsState,
  };
}
