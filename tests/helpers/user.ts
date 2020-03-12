const user = {
  state: {
    dataSource: {
      name: 'testName',
    },
    todos: 1,
    auth: false,
  },
  reducers: {
    setTodos(prevState, todos: number) {
      return { ...prevState, todos };
    },
    // update(prevState, payload) {
    //   return {
    //     ...prevState,
    //     ...payload,
    //   };
    // },
  },
  // effects: {
  //   async login(prevState, payload, actions) {
  //     const dataSource = {
  //       name: 'name',
  //     };
  //     const auth = true;

  //     actions.update({
  //       dataSource,
  //       auth,
  //     });
  //   },
  // },
};

export default user;
