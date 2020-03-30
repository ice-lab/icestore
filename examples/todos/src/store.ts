
import { createStore } from '@ice/store';
import * as models from './models';

const initialState = {
  user: {
    dataSource: {
      name: 'Tom',
    },
    auth: true,
    todos: 5,
  },
}

export default createStore(models, { initialState });
