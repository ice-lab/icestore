import { Models } from '@ice/store';
import todos from './todos';
import visibilityFilter from './visibilityFilter';

const rootModels: RootModels = { todos, visibilityFilter };

// add interface to avoid recursive type checking
export interface RootModels extends Models {
  todos: typeof todos;
  visibilityFilter: typeof visibilityFilter;
}

export default rootModels;
