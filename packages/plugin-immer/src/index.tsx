import produce, { enableES5 } from 'immer';
import { combineReducers, ReducersMapObject } from 'redux';
import { Action, Models, Plugin } from '@ice/store';

// make it work in IE11
enableES5();

export interface ImmerConfig {
  blacklist?: string[];
}

// https://github.com/ice-lab/icestore/issues/94
// TODO: fix error & loading plugin immer problem
function createCombineReducersWithImmer(blacklist: string[] = ['loading', 'error']) {
  return function (reducers: ReducersMapObject) {
    const reducersWithImmer: ReducersMapObject<any, Action<any>> = {};
    // reducer must return value because literal don't support immer

    Object.keys(reducers).forEach((key) => {
      const reducerFn = reducers[key];
      reducersWithImmer[key] = (state, payload) =>
        typeof state === 'object' && !blacklist.includes(key)
          ? produce(state, (draft: Models) => {
            const next = reducerFn(draft, payload);
            if (typeof next === 'object') return next;
          })
          : reducerFn(state, payload);
    });

    return combineReducers(reducersWithImmer);
  };
}

// icestore plugin
const immerPlugin = (config: ImmerConfig = {}): Plugin => ({
  config: {
    redux: {
      combineReducers: createCombineReducersWithImmer(config.blacklist),
    },
  },
});

export default immerPlugin;
