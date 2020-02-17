
import { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import isPromise from 'is-promise';
import transform from 'lodash.transform';
import { createContainer } from './createContainer';
import {
  ReactSetState,
  ModelProps,
  ModelConfig,
  ActionsPayload,
  SetActionsPayload,
  ActionsIdentifier,
  FunctionState,
  TModel,
  TModelConfigState,
  TModelConfigActions,
  TModelActions,
  TModelActionsState,
  SetFunctionsState,
  TUseModelValue,
} from './types';

const isDev = process.env.NODE_ENV !== 'production';

export function createModel<M extends ModelConfig, K = string>(config: M, namespace?: K, modelsActions?): TModel<M> {
  type ModelState = TModelConfigState<M>;
  type ModelConfigActions = TModelConfigActions<M>;
  type ModelConfigActionsKey = keyof ModelConfigActions;
  type ModelActions = TModelActions<M>;
  type ModelActionsState = TModelActionsState<M>;
  type SetModelFunctionsState = SetFunctionsState<ModelConfigActions>;
  type UseModelValue = TUseModelValue<M>;

  const { state: defineState = {}, actions: defineActions = [] } = config;
  let actions;

  function useFunctionsState(functions: ModelConfigActionsKey[]):
  [ ModelActionsState, SetModelFunctionsState, (name: ModelConfigActionsKey, args: FunctionState) => void ] {
    const functionsInitialState = useMemo<ModelActionsState>(
      () => transform(functions, (result, name) => {
        result[name] = {
          isLoading: false,
          error: null,
        };
      }, {}),
      [functions],
    );
    const [ functionsState, setFunctionsState ] = useState<ModelActionsState>(() => functionsInitialState);
    const setFunctionState = useCallback(
      (name: ModelConfigActionsKey, args: FunctionState) => setFunctionsState(prevState => ({
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

  function useActions(state: ModelState, setState: ReactSetState<ModelState>):
  [ ActionsPayload<ModelActions>, (name: ModelConfigActionsKey, payload: any) => void, ModelActionsState ] {
    const [ actionsState, , setActionsState ] = useFunctionsState(Object.keys(defineActions));
    const [ actionsInitialPayload, actionsInitialIdentifier ]: [ActionsPayload<ModelActions>, ActionsIdentifier<ModelActions>] = useMemo(
      () => transform(defineActions, (result, action, name) => {
        const state = {
          payload: null,
          identifier: 0,
        };
        result[0][name] = state;
        result[1][name] = state.identifier;
      }, [ {}, {} ]),
      [],
    );
    const [ actionsPayload, setActionsPayload ]: [ ActionsPayload<ModelActions>, SetActionsPayload<ModelActions> ] = useState(() => actionsInitialPayload);
    const setActionPayload = useCallback(
      (name, payload) => setActionsPayload(prevState => ({
        ...prevState,
        [name]: {
          ...prevState[name],
          payload,
          identifier: prevState[name].identifier + 1,
        },
      })),
      [],
    );

    const actionsIdentifier = useRef(actionsInitialIdentifier);
    const actionsPayloadIdentifier = Object.keys(actionsPayload).map((name) => actionsPayload[name].identifier);

    useEffect(() => {
      Object.keys(actionsPayload).forEach((name) => {
        const { identifier, payload } = actionsPayload[name];
        if (identifier && identifier !== actionsIdentifier.current[name]) {
          actionsIdentifier.current = {
            ...actionsIdentifier.current,
            [name]: identifier,
          };
          (async () => {
            const nextState = defineActions[name](state, payload, actions, modelsActions);
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

    return [ actionsPayload, setActionPayload, actionsState ];
  }

  function useModel({ initialState }: ModelProps<ModelState>): UseModelValue {
    const preloadedState = initialState || (defineState as ModelState);
    const [ state, setState ] = useState<ModelState>(preloadedState);
    const [ , executeAction, actionsState ] = useActions(state, setState);

    actions = useMemo(() => transform(defineActions, (result, fn, name) => {
      result[name] = (payload) => executeAction(name, payload);
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
