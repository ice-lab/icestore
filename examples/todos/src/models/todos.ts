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

  actions: {
    async refresh(prevState, actions, globalActions) {
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
      globalActions.user.setTodos(dataSource.length);
      return {
        ...prevState,
        dataSource,
      };
    },
    toggle(prevState, index) {
      prevState.dataSource[index].done = !prevState.dataSource[index].done;
      return {
        ...prevState,
      };
    },
    add(prevState, todo, actions, globalActions) {
      prevState.dataSource.push(todo);
      globalActions.user.setTodos(prevState.dataSource.length);
      return {
        ...prevState,
      };
    },
    async remove(prevState, index, globalActions) {
      await delay(1000);

      prevState.dataSource.splice(index, 1);
      globalActions.user.setTodos(prevState.dataSource.length);
      return {
        ...prevState,
      };
    },
  },
};

export default store;
