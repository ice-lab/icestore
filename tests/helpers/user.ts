const user = {
  state: {
    dataSource: {
      name: '',
    },
    todos: 0,
    auth: false,
  },
  reducers: {
    update(prevState, payload) {
      return {
        ...prevState,
        ...payload,
      };
    },
  },
  effects: {
    async login(prevState, payload, actions) {
      const dataSource = {
        name: 'name',
      };
      const auth = true;

      actions.update({
        dataSource,
        auth,
      });
    },
  },
};

export default user;
