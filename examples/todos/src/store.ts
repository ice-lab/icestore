
import { createStore, IcestoreRootState, IcestoreDispatch } from '@ice/store';
import createImmerPlugin from '@ice/store-plugin-immer';
import models from './models';

const store = createStore(models, {
  plugins: [createImmerPlugin()],
});

export default store;
export type Models = typeof models;
export type Store = typeof store;
export type RootDispatch = IcestoreDispatch<Models>;
export type RootState = IcestoreRootState<Models>;
