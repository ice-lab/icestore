import { delay } from '../utils';

interface Todo {
  name: string;
  done?: boolean;
}

const store = {
  state: {
    dataSource: [],
  },

  actions: {
    async refresh(prevState, args, actions, globalActions) {
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
    toggle(prevState, index: number) {
      prevState.dataSource[index].done = !prevState.dataSource[index].done;
      return {
        ...prevState,
      };
    },
    add(prevState, todo: Todo, actions, globalActions) {
      prevState.dataSource.push(todo);
      globalActions.user.setTodos(prevState.dataSource.length);
      return {
        ...prevState,
      };
    },
    async remove(prevState, index: number, actions, globalActions) {
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
