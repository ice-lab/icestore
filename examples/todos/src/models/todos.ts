import { delay } from '../utils';

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
      };
    },
  },

  effects: {
    add(todo, state, actions) {
      state.dataSource.push(todo);
      actions.todos.setDataSource(state.dataSource);
      actions.user.setTodos(state.dataSource.length);
    },

    async refresh(state, actions) {
      await delay(2000);
      const dataSource: any[] = [
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
      ];
      actions.todos.setDataSource(dataSource);
      actions.user.setTodos(dataSource.length);
    },

    async remove(index, state, actions) {
      await delay(1000);

      state.dataSource.splice(index, 1);
      actions.todos.setDataSource(state.dataSource);
      actions.user.setTodos(state.dataSource.length);
    },
  },
};

export default store;
