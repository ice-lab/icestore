import { Plugin } from '../typings';

export default (): Plugin => {
  return {
    onStoreCreated(store: any) {
      function useModelEffectsState(name) {
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
