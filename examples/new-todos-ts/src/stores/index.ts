import { createStore } from '../createStore';
import todos from './todos';
import user from './user';

export default createStore({todos, user});

