import { Plugin } from '../typings';
import warning from '../utils/warning';

/**
 * Hooks Plugin
 *
 * generates hooks for store
 */
export default (): Plugin => {
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

      return {
        useModel,
        useModelState,
        useModelDispatch,

        // @deprecated
        useModelActions,
      };
    },
  };
};

