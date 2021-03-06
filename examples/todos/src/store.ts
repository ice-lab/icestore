
import { createStore, IcestoreRootState, IcestoreDispatch } from '@ice/store';
import models from './models';

const store = createStore(models);

export default store;
export type Models = typeof models;
export type Store = typeof store;
export type RootDispatch = IcestoreDispatch<Models>;
export type RootState = IcestoreRootState<Models>;
