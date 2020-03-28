import { createSelectorHook, createDispatchHook } from 'react-redux';

export default function(context) {
  const useSelector = createSelectorHook(context);
  const useDispatch = createDispatchHook(context);

  function useModel(name: string) {
    const state = useModelState(name);
    const dispatch = useModelDispatch(name);
    return [state, dispatch];
  }
  function useModelState(name: string) {
    return useSelector(state => state[name]);
  }
  function useModelDispatch(name: string) {
    const dispatch = useDispatch();
    return dispatch[name];
  }
  const useModelActions = useModelDispatch;
  function useModelEffectsLoading(name: string) {
    return useSelector(state => (state as any).loading.effects[name]);
  }
  function useModelEffectsError(name: string) {
    return useSelector(state => (state as any).error.effects[name]);
  }
  function useModelEffectsState(name: string) {
    const actions = useModelActions(name);
    const isLoadings = useModelEffectsLoading(name);
    const errors = useModelEffectsError(name);

    const states = {};
    Object.keys(actions).forEach(key => {
      states[key] = {
        isLoading: isLoadings[key],
        error: errors[key] ? errors[key].error : null,
      };
    });
    return states;
  }

  return {
    useModel,
    useModelState,
    useModelDispatch,
    useModelEffectsLoading,
    useModelEffectsError,

    // @deprecated
    useModelActions,

    // @deprecated
    useModelEffectsState,
  };
}
