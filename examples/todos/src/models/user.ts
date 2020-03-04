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
    setTodos(prevState, todos: number) {
      return { ...prevState, todos };
    },
    setState(prevState, payload) {
      return {
        ...prevState,
        ...payload,
      }
    },
  },
  effects: {
    async login(prevState, payload, actions) {
      await delay(1000);
      const dataSource = {
        name: 'Alvin',
      };
      const auth = true;

      actions.setState({
        dataSource,
        auth,
      });
    },
  },
};

export default user;
