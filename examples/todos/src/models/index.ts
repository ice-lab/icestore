import { Models } from '@ice/store';
import todos from './todos';
import user from './user';
import car from './car';

const rootModels: RootModels = { todos, user, car };

// add interface to avoid recursive type checking
export interface RootModels extends Models {
  todos: typeof todos;
  user: typeof user;
  car: typeof car;
}

export default rootModels;
