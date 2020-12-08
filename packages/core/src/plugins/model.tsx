import React from 'react';
import { createSelectorHook, createDispatchHook, Provider as ReduxProvider } from 'react-redux';
import * as T from '../types';
import warning from '../utils/warning';
import actionTypes from '../actionTypes';

const { SET_STATE } = actionTypes;

let warnedWithModelActions = false;
let warnedWithModelActionsState = false;

interface ModelConfig {
  context: React.Context<null>;
}

/**
 * Model Plugin
 *
 * generates hooks for store
 */
export default ({ context }: ModelConfig): T.Plugin => {
  return {
    onStoreCreated(store: any) {
      const useSelector = createSelectorHook(context);
      const useDispatch = createDispatchHook(context);
      const Provider = function (props) {
        const { children, initialStates } = props;
        if (initialStates) {
          Object.keys(initialStates).forEach(name => {
            const initialState = initialStates[name];
            if (initialState && store.dispatch[name][SET_STATE]) {
              store.dispatch[name][SET_STATE](initialState);
            }
          });
        }
        return (
          <ReduxProvider store={store} context={context}>
            {children}
          </ReduxProvider>
        );
      };

      // hooks
      function useModel(name) {
        const state = useModelState(name);
        const dispatchers = useModelDispatchers(name);
        return [state, dispatchers];
      }
      function useModelState(name) {
        const selector = useSelector(state => state[name]);
        if (typeof selector !== "undefined") {
          return selector;
        }
        throw new Error(`Not found model by namespace: ${name}.`);
      }
      function useModelDispatchers(name) {
        const dispatch = useDispatch();
        if (dispatch[name]) {
          return dispatch[name];
        }
        throw new Error(`Not found model by namespace: ${name}.`);
      }
      function useModelEffectsState(name) {
        const dispatch = useModelDispatchers(name);
        const effectsLoading = useModelEffectsLoading(name);
        const effectsError = useModelEffectsError(name);

        const states = {};
        Object.keys(dispatch).forEach(key => {
          states[key] = {
            isLoading: effectsLoading[key],
            error: effectsError[key] ? effectsError[key].error : null,
          };
        });
        return states;
      }
      function useModelEffectsError(name) {
        return useSelector(state => state.error ? state.error.effects[name] : undefined);
      }
      function useModelEffectsLoading(name) {
        return useSelector(state => state.loading ? state.loading.effects[name] : undefined);
      }

      // other apis
      function getModel(name) {
        return [getModelState(name), getModelDispatchers(name)];
      }
      function getModelState(name) {
        return store.getState()[name];
      }
      function getModelDispatchers(name) {
        return store.dispatch[name];
      }

      // class component support
      function withModel(name, mapModelToProps?) {
        mapModelToProps = (mapModelToProps || ((model) => ({ [name]: model })));
        return (Component) => {
          return (props): React.ReactElement => {
            const value = useModel(name);
            const withProps = mapModelToProps(value);
            return (
              <Component
                {...withProps}
                {...props}
              />
            );
          };
        };
      }

      const actionsSuffix = 'Actions';
      function createWithModelDispatchers(fieldSuffix = 'Dispatchers') {
        return function withModelDispatchers(name, mapModelDispatchersToProps?) {
          if (fieldSuffix === actionsSuffix && !warnedWithModelActions) {
            warnedWithModelActions = true;
            warning('`withModelActions` API has been detected, please use `withModelDispatchers` instead. \n\n\n Visit https://github.com/ice-lab/icestore/blob/master/docs/upgrade-guidelines.md#withmodelactions to learn about how to upgrade.');
          }
          mapModelDispatchersToProps = (mapModelDispatchersToProps || ((dispatch) => ({ [`${name}${fieldSuffix}`]: dispatch })));
          return (Component) => {
            return (props): React.ReactElement => {
              const dispatchers = useModelDispatchers(name);
              const withProps = mapModelDispatchersToProps(dispatchers);
              return (
                <Component
                  {...withProps}
                  {...props}
                />
              );
            };
          };
        };
      }
      const withModelDispatchers = createWithModelDispatchers();

      const actionsStateSuffix = 'ActionsState';
      function createWithModelEffectsState(fieldSuffix = 'EffectsState') {
        return function(name, mapModelEffectsStateToProps?) {
          if (fieldSuffix === actionsStateSuffix && !warnedWithModelActionsState) {
            warnedWithModelActionsState = true;
            warning('`withModelActionsState` API has been detected, please use `withModelEffectsState` instead. \n\n\n Visit https://github.com/ice-lab/icestore/blob/master/docs/upgrade-guidelines.md#withmodelactionsstate to learn about how to upgrade.');
          }

          mapModelEffectsStateToProps = (mapModelEffectsStateToProps || ((effectsState) => ({ [`${name}${fieldSuffix}`]: effectsState })));
          return (Component) => {
            return (props): React.ReactElement => {
              const value = useModelEffectsState(name);
              const withProps = mapModelEffectsStateToProps(value);
              return (
                <Component
                  {...withProps}
                  {...props}
                />
              );
            };
          };
        };
      }
      const withModelEffectsState = createWithModelEffectsState();

      function withModelEffectsError(name, mapModelEffectsErrorToProps?) {
        mapModelEffectsErrorToProps = (mapModelEffectsErrorToProps || ((errors) => ({ [`${name}EffectsError`]: errors })));
        return (Component) => {
          return (props): React.ReactElement => {
            const value = useModelEffectsError(name);
            const withProps = mapModelEffectsErrorToProps(value);
            return (
              <Component
                {...withProps}
                {...props}
              />
            );
          };
        };
      }

      function withModelEffectsLoading(name?, mapModelEffectsLoadingToProps?) {
        mapModelEffectsLoadingToProps = (mapModelEffectsLoadingToProps || ((loadings) => ({ [`${name}EffectsLoading`]: loadings })));
        return (Component) => {
          return (props): React.ReactElement => {
            const value = useModelEffectsLoading(name);
            const withProps = mapModelEffectsLoadingToProps(value);
            return (
              <Component
                {...withProps}
                {...props}
              />
            );
          };
        };
      }

      function getModelAPIs(name) {
        return {
          useValue: () => useModel(name),
          useState: () => useModelState(name),
          useDispatchers: () => useModelDispatchers(name),
          useEffectsState: () => useModelEffectsState(name),
          useEffectsError: () => useModelEffectsError(name),
          useEffectsLoading: () => useModelEffectsLoading(name),
          getValue: () => getModel(name),
          getState: () => getModelState(name),
          getDispatchers: () => getModelDispatchers(name),
          withValue: (mapToProps?) => withModel(name, mapToProps),
          withDispatchers: (mapToProps?) => withModelDispatchers(name, mapToProps),
          withEffectsState: (mapToProps?) => withModelEffectsState(name, mapToProps),
          withEffectsError: (mapToProps?) => withModelEffectsError(name, mapToProps),
          withEffectsLoading: (mapToProps?) => withModelEffectsLoading(name, mapToProps),
        };
      }

      return {
        // APIs for redux
        Provider,
        context,

        // Hooks for redux
        useSelector,
        useDispatch,

        getModelAPIs,

        // Hooks for model
        useModel,
        useModelState,
        useModelDispatchers,
        useModelEffectsState,
        useModelEffectsError,
        useModelEffectsLoading,

        // real time
        getModel,
        getModelState,
        getModelDispatchers,

        // Class component support
        withModel,
        withModelDispatchers,
        withModelEffectsState,
        withModelEffectsError,
        withModelEffectsLoading,
        withModelActions: createWithModelDispatchers(actionsSuffix),
        withModelActionsState: createWithModelEffectsState(actionsStateSuffix),
      };
    },
  };
};
