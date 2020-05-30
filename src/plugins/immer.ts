import origProduce, { enableES5 } from 'immer';
import { combineReducers, ReducersMapObject } from 'redux';
import * as T from '../types';

function produce(state, func) {
  enableES5()
  return origProduce.apply(null, [state, func])
}

export interface ImmerConfig {
  blacklist?: string[];
}

function createCombineReducersWithImmer(blacklist: string[] = []) {
  return function (reducers: ReducersMapObject) {
    const reducersWithImmer: ReducersMapObject<any, T.Action<any>> = {};
    // reducer must return value because literal don't support immer

    Object.keys(reducers).forEach((key) => {
      const reducerFn = reducers[key];
      reducersWithImmer[key] = (state, payload) =>
        typeof state === 'object' && !blacklist.includes(key)
          ? produce(state, (draft: T.Models) => {
            const next = reducerFn(draft, payload);
            if (typeof next === 'object') return next;
          })
          : reducerFn(state, payload);
    });

    return combineReducers(reducersWithImmer);
  };
}

// icestore plugin
const immerPlugin = (config: ImmerConfig = {}): T.Plugin => ({
  config: {
    redux: {
      combineReducers: createCombineReducersWithImmer(config.blacklist),
    },
  },
});

export default immerPlugin;
