import produce from 'immer';
import { combineReducers, ReducersMapObject } from 'redux';
import * as T from '../typings';

function combineReducersWithImmer(reducers: ReducersMapObject) {
  const reducersWithImmer: ReducersMapObject<any, T.Action<any>> = {};
  // reducer must return value because literal don't support immer

  Object.keys(reducers).forEach((key) => {
    const reducerFn = reducers[key];
    reducersWithImmer[key] = (state, payload) =>
      typeof state === 'object'
        ? produce(state, (draft: T.Models) => {
          const next = reducerFn(draft, payload);
          if (typeof next === 'object') return next;
        })
        : reducerFn(state, payload);
  });

  return combineReducers(reducersWithImmer);
}

// icestore plugin
const immerPlugin = (): T.Plugin => ({
  config: {
    redux: {
      combineReducers: combineReducersWithImmer,
    },
  },
});

export default immerPlugin;
