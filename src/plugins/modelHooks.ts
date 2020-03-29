import * as T from '../typings';
import warning from '../utils/warning';

/**
 * ModelHooks Plugin
 *
 * generates hooks for store
 */
export default (): T.Plugin => {
  return {
    onStoreCreated(store: any) {
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
        warning('useModelActions is not recommended, please use `useModelDispatch`');
        return useModelDispatch(name);
      }
      function getModel(name: string) {
        return [getModelState(name), getModelDispatch(name)];
      }
      function getModelState(name: string) {
        return store.getState()[name];
      }
      function getModelDispatch(name: string) {
        return store.dispatch()[name];
      }

      return {
        useModel,
        useModelState,
        useModelDispatch,

        getModel,
        getModelState,
        getModelDispatch,

        // @deprecated
        useModelActions,
      };
    },
  };
};

