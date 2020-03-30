import React from 'react';
import * as T from '../typings';
import warning from '../utils/warning';

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
        return store.useSelector(state => state[name]);
      }
      function useModelDispatchers(name: string) {
        const dispatch = store.useDispatch();
        return dispatch[name];
      }

      // @deprecated
      function useModelActions(name: string) {
        warning('`useModelActions` is not recommended, please use `useModelDispatchers` instead.');
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
        return store.dispatch()[name];
      }
      function withModel(name: string, mapModelToProps?: any) {
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
        return function withModelDispatchers(name: string, mapModelDispatchersToProps?: any) {
          if (fieldSuffix === actionsSuffix) {
            warning('`withModelActions` is not recommended, please use `withModelDispatchers` instead.');
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

      return {
        useModel,
        useModelState,
        useModelDispatchers,

        getModel,
        getModelState,
        getModelDispatchers,
        withModel,
        withModelDispatchers: createWithModelDispatchers(),

        useModelActions,
        // @deprecated
        withModelActions: createWithModelDispatchers(actionsSuffix),
      };
    },
  };
};

