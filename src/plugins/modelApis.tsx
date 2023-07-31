import React from 'react';
import * as T from '../types';

/**
 * ModelApis Plugin
 *
 * generates hooks for store
 */
export default (): T.Plugin => {
  return {
    onStoreCreated(store: any) {
      // hooks
      function useModel(name) {
        const state = useModelState(name);
        const dispatchers = useModelDispatchers(name);
        return [state, dispatchers];
      }
      function useModelState(name) {
        const selector = store.useSelector(state => state[name]);
        if (typeof selector !== 'undefined') {
          return selector;
        }
        throw new Error(`Not found model by namespace: ${name}.`);
      }
      function useModelDispatchers(name) {
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
        return store.useSelector(state => (state.error ? state.error.effects[name] : undefined));
      }
      function useModelEffectsLoading(name) {
        return store.useSelector(state => (state.loading ? state.loading.effects[name] : undefined));
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


      function createWithModelDispatchers(fieldSuffix = 'Dispatchers') {
        return function withModelDispatchers(name, mapModelDispatchersToProps?) {
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

      function createWithModelEffectsState(fieldSuffix = 'EffectsState') {
        return function (name, mapModelEffectsStateToProps?) {
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
        getModelAPIs,

        // Hooks
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
      };
    },
  };
};
