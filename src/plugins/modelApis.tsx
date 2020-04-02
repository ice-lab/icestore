import React from 'react';
import * as T from '../types';
import warning from '../utils/warning';

let warnedUseModelActions = false;
let warnedWithModelActions = false;

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

      function useModelActions(name: string) {
        if (!warnedUseModelActions) {
          warnedUseModelActions = true;
          warning('`useModelActions` API has been detected, please use `useModelDispatchers` instead. \n\n\n https://github.com/ice-lab/icestore/blob/master/docs/upgrade-guidelines.md#usemodelactions');
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
        return store.dispatch()[name];
      }
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
            warning('`withModelActions` API has been detected, please use `withModelDispatchers` instead. \n\n\n https://github.com/ice-lab/icestore/blob/master/docs/upgrade-guidelines.md#withmodelactions');
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
        // Hooks
        useModel,
        useModelState,
        useModelDispatchers,

        // real time
        getModel,
        getModelState,
        getModelDispatchers,

        // Class component support
        withModel,
        withModelDispatchers: createWithModelDispatchers(),

        // @deprecated
        useModelActions,
        withModelActions: createWithModelDispatchers(actionsSuffix),
      };
    },
  };
};

