interface Todo {
  name: string;
  done?: boolean;
}

export interface TodoStore {
  dataSource: Todo[];
  refresh: () => void;
  add: (todo: Todo) => void;
  remove: (index: number) => void;
  toggle: (index: number) => void;
}

const store = {
  state: {
    dataSource: [],
  },

  reducers: {
    toggle(prevState, index) {
      prevState.dataSource[index].done = !prevState.dataSource[index].done;
      return {
        ...prevState,
      };
    },
    setDataSource(prevState, todos) {
      return {
        dataSource: todos,
      }
    }
  },

  effects: {
    add(todo, rootState, actions) {
      rootState.dataSource.push(todo);
      actions.todos.setDataSource(rootState.dataSource);
      actions.user.setTodos(rootState.dataSource.length);
    },

    async refresh(rootState, actions) {
      const dataSource: any[] = await new Promise(resolve =>
        setTimeout(() => {
          resolve([
            {
              name: 'react',
            },
            {
              name: 'vue',
              done: true,
            },
            {
              name: 'angular',
            },
          ]);
        }, 1000),
      );
      actions.todos.setDataSource(dataSource);
      actions.user.setTodos(dataSource.length);
    },

    async remove(index, rootState, actions) {
      await new Promise(resolve =>
        setTimeout(() => {
          resolve();
        }, 1000),
      );
      rootState.dataSource.splice(index, 1);
      actions.todos.setDataSource(rootState.dataSource);
      actions.user.setTodos(rootState.dataSource.length);
    },
  }
};

export default store;
