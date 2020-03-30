import React from 'react';
import * as T from '../typings';
import warning from '../utils/warning';

/**
 * EffectsStateApis Plugin
 *
 * Plugin for provide store.useModelEffectsState
 */
export default (): T.Plugin => {
  return {
    onStoreCreated(store: any) {
      function createUseModelEffectsState(fnName) {
        return function(name) {
          const dispatch = store.useModelDispatchers(name);
          const effectsLoading = store.useModelEffectsLoading ? store.useModelEffectsLoading(name) : {};
          const effectsError = store.useModelEffectsError ? store.useModelEffectsError(name) : {};

          const states = {};
          Object.keys(dispatch).forEach(key => {
            states[key] = {
              isLoading: effectsLoading[key],
              error: effectsError[key] ? effectsError[key].error : null,
            };
          });
          return states;
        };
      }

      const useModelEffectsState = createUseModelEffectsState('useModelEffectsState');

      const actionsSuffix = 'ActionsState';
      function createWithModelEffectsState(fieldSuffix: string = 'EffectsState') {
        return function withModelEffectsState(name?: string, mapModelEffectsStateToProps?: any) {
          if (fieldSuffix === actionsSuffix) {
            warning('`withModelActionsState` API has been detected, please use `useModelEffectsState` instead.');
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
      return {
        useModelEffectsState,
        useModelActionsState: createUseModelEffectsState('useModelActionsState'),
        withModelEffectsState: createWithModelEffectsState(),
        withModelActionsState: createWithModelEffectsState(actionsSuffix),
      };
    },
  };
};
