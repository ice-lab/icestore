import React from 'react';
import transform from 'lodash.transform';
import { createModel } from './createModel';
import {
  Configs,
  Model,
  ConfigPropTypeState,
  ModelActions,
  ModelActionsState,
} from './types';

export function createStore<C extends Configs>(configs: C) {
  function getModel<K extends keyof C>(namespace: K): Model<C[K]> {
    const model = models[namespace];
    if (!model) {
      throw new Error(`Not found model by namespace: ${namespace}.`);
    }
    return model;
  }

  function Provider({ children, initialStates = {} }) {
    Object.keys(models).forEach(namespace => {
      const [ ModelProvider ] = getModel(namespace);
      children = <ModelProvider initialState={initialStates[namespace]}>
        {children}
      </ModelProvider>;
    });
    return <>{children}</>;
  }

  function useModelState<K extends keyof C>(namespace: K): ConfigPropTypeState<C[K]> {
    const [, useModelState ] = getModel(namespace);
    return useModelState();
  }

  function useModelActions<K extends keyof C>(namespace: K): ModelActions<C[K]> {
    const [, , useModelActions ] = getModel(namespace);
    return useModelActions();
  }

  function useModelActionsState<K extends keyof C>(namespace: K): ModelActionsState<C[K]> {
    const [, , , useModelActionsState ] = getModel(namespace);
    return useModelActionsState();
  }

  function useModel<K extends keyof C>(namespace: K): [ConfigPropTypeState<C[K]>, ModelActions<C[K]>] {
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
  const models: { [K in keyof C]?: Model<C[K]> } = transform(configs, (result, config, namespace) => {
    result[namespace] = createModel(config, namespace, modelsActions);
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
