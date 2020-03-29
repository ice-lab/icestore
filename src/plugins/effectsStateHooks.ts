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
        warning('useModelEffectsState is not recommended, please use `useModelEffectsLoading` and `useModelEffectsError`');
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
      return { useModelEffectsState };
    },
  };
};
