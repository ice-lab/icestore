import { delay } from '../utils';

export interface Todo {
  name: string;
  done?: boolean;
}

export interface TodosState {
  dataSource: Todo[];
}

const todos = {
  state: {
    dataSource: [
      {
        name: 'Init',
        done: false,
      },
    ],
  },

  actions: {
    async refresh(prevState: TodosState, args, actions, globalActions) {
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
    toggle(prevState: TodosState, index: number) {
      prevState.dataSource[index].done = !prevState.dataSource[index].done;
      return {
        ...prevState,
      };
    },
    add(prevState: TodosState, todo: Todo, actions, globalActions) {
      prevState.dataSource.push(todo);
      globalActions.user.setTodos(prevState.dataSource.length);
      return {
        ...prevState,
      };
    },
    async remove(prevState: TodosState, index: number, actions, globalActions) {
      await delay(1000);

      prevState.dataSource.splice(index, 1);
      globalActions.user.setTodos(prevState.dataSource.length);
      return {
        ...prevState,
      };
    },
  },
};

export default todos;
