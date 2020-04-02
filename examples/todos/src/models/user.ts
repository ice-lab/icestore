import { delay } from '../utils';

export interface UserState {
  dataSource: {
    name: string;
  },
  todos: number;
  auth: boolean;
}

const model = {
  state: {
    dataSource: {
      name: '',
    },
    todos: 0,
    auth: false,
  },
  reducers: {
    setTodos(state: UserState, todos: number) {
      state.todos = todos;
    },
  },
  effects: () => ({
    async login() {
      await delay(1000);

      this.update({
        dataSource: {
          name: 'Alvin',
        },
        auth: true,
      });
    },
  }),
};

export default model;
