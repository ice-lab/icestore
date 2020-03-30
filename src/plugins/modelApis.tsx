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
        const dispatch = useModelDispatch(name);
        return [state, dispatch];
      }
      function useModelState(name: string) {
        return store.useSelector(state => state[name]);
      }
      function useModelDispatch(name: string) {
        const dispatch = store.useDispatch();
        return dispatch[name];
      }
      function useModelActions(name: string) {
        warning('`useModelActions` is not recommended, please use `useModelDispatch`');
        return useModelDispatch(name);
      }

      // other apis
      function getModel(name: string) {
        return [getModelState(name), getModelDispatch(name)];
      }
      function getModelState(name: string) {
        return store.getState()[name];
      }
      function getModelDispatch(name: string) {
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
      function createWithModelDispatch(fieldSuffix: string = 'Dispatch') {
        return function withModelActions(name: string, mapModelDispatchToProps?: any) {
          if (fieldSuffix === actionsSuffix) {
            warning('`withModelActions` is not recommended, please use `withModelDispatch`');
          }
          mapModelDispatchToProps = (mapModelDispatchToProps || ((dispatch) => ({ [`${name}${fieldSuffix}`]: dispatch })));
          return (Component) => {
            return (props): React.ReactElement => {
              const value = useModelActions(name);
              const withProps = mapModelDispatchToProps(value);
              return (
                <Component
                  {...withProps}
                  {...props}
                />
              );
            };
          };
        }
      }

      return {
        useModel,
        useModelState,
        useModelDispatch,

        getModel,
        getModelState,
        getModelDispatch,
        withModel,
        withModelDispatch: createWithModelDispatch(),

        // @deprecated
        useModelActions,

        // @deprecated
        withModelActions: createWithModelDispatch(actionsSuffix),
      };
    },
  };
};

