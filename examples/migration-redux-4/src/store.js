import { createStore } from '@ice/store';

import sharks from './models/sharks';
import dolphins from './models/dolphins';

const store = createStore(
  { sharks, dolphins },
);

export default store;
