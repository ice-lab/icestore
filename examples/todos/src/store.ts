
import { createStore, IcestoreRootState, IcestoreDispatch } from '@ice/store';
import models from './models';

const initialState = {
  user: {
    dataSource: {
      name: 'Tom',
    },
    auth: true,
    todos: 5,
  },
};

const store = createStore(models, { initialState });

export default store;
export type Store = typeof store;
export type RootDispatch = IcestoreDispatch<typeof models>;
export type iRootState = IcestoreRootState<typeof models>;
