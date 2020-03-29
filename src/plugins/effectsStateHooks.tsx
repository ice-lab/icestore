import React from 'react';
import * as T from '../typings';
import warning from '../utils/warning';

/**
 * @deprecated
 * EffectsStateHooks Plugin
 *
 * Plugin for provide store.useModelEffectsState
 */
export default (): T.Plugin => {
  return {
    onStoreCreated(store: any) {
      function useModelEffectsState(name) {
        warning('`useModelEffectsState` is not recommended, please use `useModelEffectsLoading` and `useModelEffectsError`');
        const dispatch = store.useModelDispatch(name);
        const isLoadings = store.useModelEffectsLoading(name);
        const errors = store.useModelEffectsError(name);

        const states = {};
        Object.keys(dispatch).forEach(key => {
          states[key] = {
            isLoading: isLoadings[key],
            error: errors[key] ? errors[key].error : null,
          };
        });
        return states;
      };
      function createWithModelEffectsState(fieldSuffix: string = 'EffectsState') {
        return function withModelEffectsState(name?: string, mapModelEffectsStateToProps?: any) {
          warning('`withModelEffectsState` is not recommended, please use `withModelEffectsLoading` and `withModelEffectsError`');

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
        withModelActionsState: createWithModelEffectsState('ActionsState'),
      };
    },
  };
};
