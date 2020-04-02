import React from 'react';
import * as T from '../types';
import warning from '../utils/warning';

let warnedUseModelActionsState = false;
let warnedWithModelActionsState = false;

/**
 * EffectsStateApis Plugin
 *
 * Plugin for provide store.useModelEffectsState
 */
export default (): T.Plugin => {
  return {
    onStoreCreated(store: any) {
      function useModelEffectsState(name) {
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

      function useModelActionsState(name) {
        if (!warnedUseModelActionsState) {
          warning('`useModelActionsState` API has been detected, please use `useModelEffectsState` instead. \n\n\n https://github.com/ice-lab/icestore/blob/master/docs/upgrade-guidelines.md#usemodelactionsstate');
        }
        return useModelEffectsState(name);
      }

      const actionsSuffix = 'ActionsState';
      function createWithModelEffectsState(fieldSuffix: string = 'EffectsState') {
        return function(name: string, mapModelEffectsStateToProps?) {
          if (fieldSuffix === actionsSuffix && !warnedWithModelActionsState) {
            warnedWithModelActionsState = true;
            warning('`withModelActionsState` API has been detected, please use `withModelEffectsState` instead. \n\n\n https://github.com/ice-lab/icestore/blob/master/docs/upgrade-guidelines.md#withmodelactionsstate');
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
        withModelEffectsState: createWithModelEffectsState(),

        // @deprecated
        useModelActionsState,
        withModelActionsState: createWithModelEffectsState(actionsSuffix),
      };
    },
  };
};
