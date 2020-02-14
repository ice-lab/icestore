import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import transform from 'lodash.transform';
import { createContainer } from './createContainer';
import { Model } from './types';

const isDev = process.env.NODE_ENV !== 'production';

export function createStore(models: {[namespace: string]: Model}) {
  const modelActions = {};
  const containers = transform(models, (result, model, namespace) => {
    const { state: defineState = {}, reducers = [], effects = [] } = model;

    function useModel({ initialState }) {
      const preloadedState = initialState || defineState;
      const [state, setState] = useState(preloadedState);

      const [effectsInitialState, effectsInitialIdentifier] = useMemo(
        () => transform(effects, (result, effect, name) => {
          const state = {
            isLoading: false,
            error: null,
            args: [],
            identifier: 0
          };
          result[0][name] = state;
          result[1][name] = state.identifier;
        }, [{}, {}]),
        [effects]
      );
      const [effectsState, setEffectsState] = useState(() => effectsInitialState);
      const setEffectState = useCallback(
        (name, nextState) => setEffectsState(prevState => ({
          ...prevState,
          [name]: {
            ...prevState[name],
            ...nextState(prevState[name]),
          }
        })),
        []
      );
      const effectsIdentifier = useRef(effectsInitialIdentifier);
      const effectsIdentifierState = Object.keys(effectsState).map((name) => effectsState[name].identifier);

      useEffect(() => {
        Object.keys(effectsState).forEach((name) => {
          const { identifier, args } = effectsState[name];
          if (identifier && identifier !== effectsIdentifier.current[name].identifier) {
            effectsIdentifier.current = {
              ...effectsIdentifier.current,
              [name]: { identifier, },
            };
            (async () => {
              setEffectState(name, () => ({
                isLoading: true,
                error: null,
              }));
              try {
                await effects[name].apply(actions, [...args, state, modelActions]);
                setEffectState(name, () => ({
                  isLoading: false,
                  error: null,
                }));
              } catch (error) {
                setEffectState(name, () => ({
                  isLoading: false,
                  error,
                }));
              }
            })()
          }
        });
      }, [effectsIdentifierState]);

      const actions = useMemo(() => ({
        ...transform(reducers, (result, fn, name) => {
          result[name] = (...args) => setState((prevState) => fn(prevState, ...args));
        }),
        ...transform(effects, (result, fn, name) => {
          result[name] = (...args) => setEffectState(name, ({ identifier }) => ({ args, identifier: identifier + 1, }));
        })
      }), [reducers, effects]);

      modelActions[namespace] = actions;
      return [{...state, effects: effectsState}, actions];
    }

    if (isDev) {
      useModel.displayName = namespace;
    }

    result[namespace] = createContainer(
      useModel,
      value => value[0], // state
      value => value[1]  // actions
    );
  });

  function Provider({ children, initialStates = {} }) {
    Object.keys(containers).forEach(namespace => {
      const [ ModelProvider ] = containers[namespace];
      children = <ModelProvider initialState={initialStates[namespace]}>
        {children}
      </ModelProvider>;
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
