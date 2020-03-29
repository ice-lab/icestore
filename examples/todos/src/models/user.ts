import { delay } from '../utils';

const user = {
  state: {
    dataSource: {
      name: '',
    },
    todos: 0,
    auth: false,
  },
  reducers: {
    setTodos(state, todos: number) {
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
  })
};

export default user;
