import { delay } from '../utils';

export interface User {
  name?: string;
  age?: number;
}

export interface UserStore {
  dataSource: User;
  auth: boolean;
  todos: number;
  login: () => void;
  setTodos: (todos: number) => void;
}

const store = {
  state: {
    dataSource: {
    },
    todos: 0,
    auth: false,
  },
  actions: {
    async login(prevState) {
      await delay(1000);
      const dataSource = {
        name: 'Alvin',
      };
      const auth = true;

      return {
        ...prevState,
        dataSource,
        auth,
      };
    },
    setTodos(prevState, todos: number) {
      return { ...prevState, todos };
    },
  },
};

export default store;
