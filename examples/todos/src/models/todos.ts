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
    },
    addData(prevState, todo) {
      return {
        dataSource: [...prevState.dataSource, todo],
      }
    },
    removeData(prevState, index) {
      prevState.dataSource.splice(index, 1);
      return {
        ...prevState
      };
    }
  },

  effects: {
    add(todo, actions) {
      actions.todos.addData(todo);
      actions.user.increaseTodos(1);
    },

    async refresh(actions) {
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

    async remove(index, actions) {
      await new Promise(resolve =>
        setTimeout(() => {
          resolve();
        }, 1000),
      );
      actions.todos.removeData(index);
      actions.user.reduceTodos(1);
    },
  }
};

export default store;
