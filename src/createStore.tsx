import React from 'react';
import transform from 'lodash.transform';
import { createModel } from './createModel';
import {
  Optionalize,
  Configs,
  Model,
  ConfigPropTypeState,
  ModelActions,
  ModelActionsState,
  UseModelValue,
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

  function useModel<K extends keyof C>(namespace: K): UseModelValue<C[K]> {
    return [ useModelState(namespace), useModelActions(namespace) ];
  }

  function withModel<K extends keyof C, M extends (model: UseModelValue<C[K]>) => Record<string, any>>(namespace: K, mapModelToProps?: M) {
    mapModelToProps = (mapModelToProps || ((model) => ({ [namespace]: model }))) as M;
    return <R extends ReturnType<typeof mapModelToProps>, P extends R>(Component: React.ComponentType<P>) => {
      return (props: Optionalize<P, R>): React.ReactElement => {
        const value = useModel(namespace);
        const withProps = mapModelToProps(value);
        return (
          <Component
            {...withProps}
            {...(props as P)}
          />
        );
      };
    };
  }

  function withModelActions<K extends keyof C, M extends (actions: ModelActions<C[K]>) => Record<string, any>>(namespace: K, mapModelActionsToProps?: M) {
    mapModelActionsToProps = (mapModelActionsToProps || ((actions) => ({ [`${namespace}Actions`]: actions }))) as M;
    return <R extends ReturnType<typeof mapModelActionsToProps>, P extends R>(Component: React.ComponentType<P>) => {
      return (props: Optionalize<P, R>): React.ReactElement => {
        const value = useModelActions(namespace);
        const withProps = mapModelActionsToProps(value);
        return (
          <Component
            {...withProps}
            {...(props as P)}
          />
        );
      };
    };
  }

  function withModelActionsState<K extends keyof C, M extends (actionsState: ModelActionsState<C[K]>) => Record<string, any>>(namespace?: K, mapModelActionsStateToProps?: M) {
    mapModelActionsStateToProps = (mapModelActionsStateToProps || ((actionsState) => ({ [`${namespace}ActionsState`]: actionsState }))) as M;
    return <R extends ReturnType<typeof mapModelActionsStateToProps>, P extends R>(Component: React.ComponentType<P>) => {
      return (props: Optionalize<P, R>): React.ReactElement => {
        const value = useModelActionsState(namespace);
        const withProps = mapModelActionsStateToProps(value);
        return (
          <Component
            {...withProps}
            {...(props as P)}
          />
        );
      };
    };
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
