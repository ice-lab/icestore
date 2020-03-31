import { createSelectorHook, createDispatchHook } from 'react-redux';
import * as T from '../types';

interface ReduxHooksConfig {
  context: any;
}

/**
 * Redux Hooks Plugin
 *
 * generates redux hooks for store
 */
export default ({ context }: ReduxHooksConfig): T.Plugin => {
  const useSelector = createSelectorHook(context);
  const useDispatch = createDispatchHook(context);

  return {
    onStoreCreated() {
      return {
        useSelector,
        useDispatch,
      };
    },
  };
};

