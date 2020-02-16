import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import isPromise from 'is-promise';
import transform from 'lodash.transform';
import { createContainer } from './createContainer';
import { Config } from './types';

const isDev = process.env.NODE_ENV !== 'production';

export function createModel(config: Config, namespace?: string, modelsActions?) {
  const { state: defineState = {}, actions: defineActions = [] } = config;
  let actions;

  function useFunctionsState(functions) {
    const functionsInitialState = useMemo(
      () => transform(functions, (result, value, name) => {
        result[name] = {
          isLoading: false,
          error: null,
        };
      }, {}),
      [functions],
    );
    const [ functionsState, setFunctionsState ] = useState(() => functionsInitialState);
    const setFunctionState = useCallback(
      (name, args) => setFunctionsState(prevState => ({
        ...prevState,
        [name]: {
          ...prevState[name],
          ...args,
        },
      })),
      [],
    );
    return [ functionsState, setFunctionsState, setFunctionState ];
  }

  function useActions(state, setState) {
    const [ actionsState, , setActionsState ] = useFunctionsState(defineActions);
    const [ actionsInitialPayload, actionsInitialIdentifier ] = useMemo(
      () => transform(defineActions, (result, action, name) => {
        const state = {
          args: [],
          identifier: 0,
        };
        result[0][name] = state;
        result[1][name] = state.identifier;
      }, [ {}, {} ]),
      [],
    );
    const [ actionsPayload, setActionsPayload ] = useState(() => actionsInitialPayload);
    const setEffectPayload = useCallback(
      (name, args) => setActionsPayload(prevState => ({
        ...prevState,
        [name]: {
          ...prevState[name],
          args,
          identifier: prevState[name].identifier + 1,
        },
      })),
      [],
    );

    const actionsIdentifier = useRef(actionsInitialIdentifier);
    const actionsPayloadIdentifier = Object.keys(actionsPayload).map((name) => actionsPayload[name].identifier);

    useEffect(() => {
      Object.keys(actionsPayload).forEach((name) => {
        const { identifier, args } = actionsPayload[name];
        if (identifier && identifier !== actionsIdentifier.current[name]) {
          actionsIdentifier.current = {
            ...actionsIdentifier.current,
            [name]: identifier,
          };
          (async () => {
            const nextState = defineActions[name](state, ...args, actions, modelsActions);
            if (isPromise(nextState)) {
              setActionsState(name, {
                isLoading: true,
                error: null,
              });
              try {
                setState(await nextState);
                setActionsState(name, {
                  isLoading: false,
                  error: null,
                });
              } catch (error) {
                setActionsState(name, {
                  isLoading: false,
                  error,
                });
              }
            } else {
              setState(nextState);
            }
          })();
        }
      });
    }, [ actionsPayloadIdentifier ]);

    return [ actionsPayload, setEffectPayload, actionsState ];
  }

  function useModel({ initialState }) {
    const preloadedState = initialState || defineState;
    const [ state, setState ] = useState(preloadedState);
    const [ , executeEffect, actionsState ] = useActions(state, setState);

    actions = useMemo(() => transform(defineActions, (result, fn, name) => {
      result[name] = (...args) => executeEffect(name, args);
    }), [defineActions]);

    if (namespace && modelsActions) {
      modelsActions[namespace] = actions;
    }
    return [ state, actions, actionsState ];
  }

  if (isDev && namespace) {
    useModel.displayName = namespace;
  }

  return createContainer(
    useModel,
    value => value[0],
    value => value[1],
    value => value[2],
  );
}

export function createStore(configs: { [namespace: string]: Config }) {
  function getModel(namespace: string) {
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

  function useModelState(namespace: string) {
    const [, useModelState ] = getModel(namespace);
    return useModelState();
  }

  function useModelActions(namespace: string) {
    const [, , useModelActions ] = getModel(namespace);
    return useModelActions();
  }

  function useModelActionsState(namespace: string) {
    const [, , , useModelActionsState ] = getModel(namespace);
    return useModelActionsState();
  }

  function useModel(namespace: string, mapState?, mapActions?, mapActionsState?) {
    mapState = typeof mapState !== 'undefined' ? mapState : (state) => state;
    mapActions = typeof mapActions !== 'undefined' ? mapActions : (actions) => actions;

    return [
      mapState && mapState(useModelState(namespace)),
      mapActions && mapActions(useModelActions(namespace)),
      mapActionsState && mapActionsState(useModelActionsState(namespace))
    ];
  }

  function useModels(namespaces: string[], createMapState?, createMapActions?, createMapActionsState?) {
    return namespaces.map((namespace) => useModel(
      namespace,
      createMapState && createMapState(namespace),
      createMapActions && createMapActions(namespace),
      createMapActionsState && createMapActionsState(namespace),
    ));
  }

  function withModel(namespace: string, mapStateToModel?, mapActionsToModel?, mapActionsStateToModel?) {
    return (Component) => {
      return (props): React.ReactElement => {
        const model = useModel(namespace, mapStateToModel, mapActionsToModel, mapActionsStateToModel);
        return (
          <Component
            model={model}
            {...props}
          />
        );
      };
    };
  }

  function withModels(namespaces: string[], createMapState?, createMapActions?, createMapActionsState?) {
    return (Component) => {
      return (props): React.ReactElement => {
        const models = useModels(namespaces, createMapState, createMapActions, createMapActionsState);
        return (
          <Component
            models={models}
            {...props}
          />
        );
      };
    };
  }

  const modelsActions = {};
  const models = transform(configs, (result, config, namespace) => {
    result[namespace] = createModel(config, namespace, modelsActions);
  });

  return {
    Provider,
    useModel,
    useModels,
    useModelState,
    useModelActions,
    useModelActionsState,
    withModel,
    withModels,
  };
}
