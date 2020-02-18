import { delay } from '../utils';

const store = {
  state: {
    dataSource: {
      name: '',
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
