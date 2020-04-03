interface DataSourceState {
  name: string;
}
class UserStateProps {
  dataSource: DataSourceState = { name: 'testName' };

  todos: number = 1;

  auth: boolean = false;
}

const user = {
  state: new UserStateProps,
  reducers: {
    setTodos(state: UserStateProps, todos: number) {
      state.todos = todos;
      return state;
    },
  },
};

export default user;
