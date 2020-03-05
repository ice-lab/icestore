
import { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import isPromise from 'is-promise';
import transform from 'lodash.transform';
import { createContainer } from './createContainer';
import {
  ReactSetState,
  ModelProps,
  Config,
  EffectsPayload,
  SetEffectsPayload,
  EffectsIdentifier,
  FunctionState,
  Model,
  ConfigPropTypeState,
  ConfigMergedEffects,
  ModelEffects,
  ModelEffectsState,
  SetFunctionsState,
  ModelValue,
} from './types';

const isDev = process.env.NODE_ENV !== 'production';

export function createModel<C extends Config, K = string>(config: C, namespace?: K, modelsActions?): Model<C> {
  type IModelState = ConfigPropTypeState<C>;
  type IModelConfigMergedEffects = ConfigMergedEffects<C>;
  type IModelConfigMergedEffectsKey = keyof IModelConfigMergedEffects;
  type IModelEffects = ModelEffects<C>;
  type IModelEffectsState = ModelEffectsState<C>;
  type IModelValue = ModelValue<C>;
  type IModelConfigMergedEffectsKeys = IModelConfigMergedEffectsKey[];
  type SetModelFunctionsState = SetFunctionsState<IModelConfigMergedEffects>;

  const {
    state: defineState = {},
    actions: defineActions = {},
    effects = {},
    reducers = {},
  } = config;
  const mergedEffects = { ...defineActions, ...effects };
  let actions;

  if (Object.keys(defineActions).length > 0) {
    console.error('The actions field is no longer recommended for the following reasons: https://github.com/ice-lab/icestore/issues/66');
  }

  function useFunctionsState(functions: IModelConfigMergedEffectsKeys):
  [ IModelEffectsState, SetModelFunctionsState, (name: IModelConfigMergedEffectsKey, args: FunctionState) => void ] {
    const functionsInitialState = useMemo<IModelEffectsState>(
      () => transform(functions, (result, name) => {
        result[name] = {
          isLoading: false,
          error: null,
        };
      }, {}),
      [functions],
    );
    const [ functionsState, setFunctionsState ] = useState<IModelEffectsState>(() => functionsInitialState);
    const setFunctionState = useCallback(
      (name: IModelConfigMergedEffectsKey, args: FunctionState) => setFunctionsState(prevState => ({
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

  function useEffects(state: IModelState, setState: ReactSetState<IModelState>):
  [ EffectsPayload<IModelEffects>, (name: IModelConfigMergedEffectsKey, payload: any) => void, IModelEffectsState ] {
    const [ effectsState, , setEffectsState ] = useFunctionsState(Object.keys(mergedEffects) as IModelConfigMergedEffectsKeys);
    const [ effectsInitialPayload, effectsInitialIdentifier ]: [EffectsPayload<IModelEffects>, EffectsIdentifier<IModelEffects>] = useMemo(
      () => transform(mergedEffects, (result, effect, name) => {
        const state = {
          payload: null,
          identifier: 0,
        };
        result[0][name] = state;
        result[1][name] = state.identifier;
      }, [ {}, {} ]),
      [],
    );
    const [ effectsPayload, setEffectsPayload ]: [ EffectsPayload<IModelEffects>, SetEffectsPayload<IModelEffects> ] = useState(() => effectsInitialPayload);
    const setEffectPayload = useCallback(
      (name, payload) => setEffectsPayload(prevState => ({
        ...prevState,
        [name]: {
          ...prevState[name],
          payload,
          identifier: prevState[name].identifier + 1,
        },
      })),
      [],
    );

    const effectsIdentifier = useRef(effectsInitialIdentifier);
    const effectsPayloadIdentifier = Object.keys(effectsPayload).map((name) => effectsPayload[name].identifier);

    useEffect(() => {
      (Object.keys(effectsPayload) as IModelConfigMergedEffectsKeys).forEach((name) => {
        const { identifier, payload } = effectsPayload[name];
        if (identifier && identifier !== effectsIdentifier.current[name]) {
          effectsIdentifier.current = {
            ...effectsIdentifier.current,
            [name]: identifier,
          };
          (async () => {
            const nextState = (mergedEffects as IModelConfigMergedEffects)[name](state, payload, actions, modelsActions);
            const isAction = defineActions[name as string];
            if (isPromise(nextState)) {
              setEffectsState(name, {
                isLoading: true,
                error: null,
              });
              try {
                const result = await nextState;
                if (isAction) {
                  setState(result);
                }
                setEffectsState(name, {
                  isLoading: false,
                  error: null,
                });
              } catch (error) {
                setEffectsState(name, {
                  isLoading: false,
                  error,
                });
              }
            } else if (isAction) {
              setState(nextState);
            }
          })();
        }
      });
    }, [ effectsPayloadIdentifier ]);

    return [ effectsPayload, setEffectPayload, effectsState ];
  }

  function useValue({ initialState }: ModelProps<IModelState>): IModelValue {
    const preloadedState = initialState || (defineState as IModelState);
    const [ state, setState ] = useState<IModelState>(preloadedState);
    const [ , executeEffect, effectsState ] = useEffects(state, setState);

    actions = useMemo(() => {
      const setEffects = transform(mergedEffects, (result, fn, name) => {
        result[name] = (payload) => executeEffect(name, payload);
      });

      const setReducers = transform(reducers, (result, fn, name) => {
        result[name] = (payload) => setState((prevState) => fn(prevState, payload));
      });

      return { ...setReducers, ...setEffects };
    }, [mergedEffects, reducers]);

    if (namespace && modelsActions) {
      modelsActions[namespace] = actions;
    }
    return [ state, actions, effectsState ];
  }

  if (isDev && namespace) {
    useValue.displayName = namespace;
  }

  return createContainer(
    useValue,
    value => value[0],
    value => value[1],
    value => value[2],
  );
}
