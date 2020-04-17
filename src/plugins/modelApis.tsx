import React from 'react';
import * as T from '../types';
import warning from '../utils/warning';

let warnedUseModelActions = false;
let warnedWithModelActions = false;
let warnedUseModelActionsState = false;
let warnedWithModelActionsState = false;


/**
 * ModelApis Plugin
 *
 * generates hooks for store
 */
export default (): T.Plugin => {
  return {
    onStoreCreated(store: any) {
      // hooks
      function useModel(name: string) {
        const state = useModelState(name);
        const dispatchers = useModelDispatchers(name);
        return [state, dispatchers];
      }
      function useModelState(name: string) {
        const selector = store.useSelector(state => state[name]);
        if (typeof selector !== "undefined") {
          return selector;
        }
        throw new Error(`Not found model by namespace: ${name}.`);
      }
      function useModelDispatchers(name: string) {
        const dispatch = store.useDispatch();
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
        return store.useSelector(state => state.error ? state.error.effects[name] : undefined);
      }
      function useModelEffectsLoading(name) {
        return store.useSelector(state => state.loading ? state.loading.effects[name] : undefined);
      }

      /**
       * @deprecated use `useModelEffectsState` instead
       */
      function useModelActionsState(name) {
        if (!warnedUseModelActionsState) {
          warnedUseModelActionsState = true;
          warning('`useModelActionsState` API has been detected, please use `useModelEffectsState` instead. \n\n\n Visit https://github.com/ice-lab/icestore/blob/master/docs/upgrade-guidelines.md#usemodelactionsstate to learn about how to upgrade.');
        }
        return useModelEffectsState(name);
      }

      /**
       * @deprecated use `useModelDispatchers` instead.
       */
      function useModelActions(name: string) {
        if (!warnedUseModelActions) {
          warnedUseModelActions = true;
          warning('`useModelActions` API has been detected, please use `useModelDispatchers` instead. \n\n\n Visit https://github.com/ice-lab/icestore/blob/master/docs/upgrade-guidelines.md#usemodelactions to learn about how to upgrade.');
        }
        return useModelDispatchers(name);
      }

      // other apis
      function getModel(name: string) {
        return [getModelState(name), getModelDispatchers(name)];
      }
      function getModelState(name: string) {
        return store.getState()[name];
      }
      function getModelDispatchers(name: string) {
        return store.dispatch[name];
      }

      // class component support
      function withModel(name: string, mapModelToProps?) {
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
      function createWithModelDispatchers(fieldSuffix: string = 'Dispatchers') {
        return function withModelDispatchers(name: string, mapModelDispatchersToProps?) {
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

      const actionsStateSuffix = 'ActionsState';
      function createWithModelEffectsState(fieldSuffix: string = 'EffectsState') {
        return function(name: string, mapModelEffectsStateToProps?) {
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

      function withModelEffectsError(name: string, mapModelEffectsErrorToProps?) {
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

      function withModelEffectsLoading(name?: string, mapModelEffectsLoadingToProps?: any) {
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

      return {
        // Hooks
        useModel,
        useModelState,
        useModelDispatchers,
        useModelEffectsState,
        useModelEffectsError,
        useModelEffectsLoading,
        useModelActions,
        useModelActionsState,

        // real time
        getModel,
        getModelState,
        getModelDispatchers,

        // Class component support
        withModel,
        withModelDispatchers: createWithModelDispatchers(),
        withModelEffectsState: createWithModelEffectsState(),
        withModelEffectsError,
        withModelEffectsLoading,
        withModelActions: createWithModelDispatchers(actionsSuffix),
        withModelActionsState: createWithModelEffectsState(actionsStateSuffix),
      };
    },
  };
};
