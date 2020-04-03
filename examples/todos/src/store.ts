
import { createStore, IcestoreRootState, IcestoreDispatch } from '@ice/store';
import models from './models';

const store = createStore(models);

export default store;
export type Store = typeof store;
export type RootDispatch = IcestoreDispatch<typeof models>;
export type iRootState = IcestoreRootState<typeof models>;
