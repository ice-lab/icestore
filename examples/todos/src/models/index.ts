import { Models } from '@ice/store';
import todos from './todos';

const rootModels: RootModels = { todos };

// add interface to avoid recursive type checking
export interface RootModels extends Models {
  todos: typeof todos;
}

export default rootModels;
