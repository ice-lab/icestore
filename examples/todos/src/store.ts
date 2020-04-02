
import { createStore, IcestoreRootState, IcestoreDispatch } from '@ice/store'
import * as models from './models';

const initialState = {
  user: {
    dataSource: {
      name: 'Tom',
    },
    auth: true,
    todos: 5,
  },
};

export default createStore(models, { initialState });
export type RootState = IcestoreDispatch<typeof models>
export type RootDispatch = IcestoreRootState<typeof models>
