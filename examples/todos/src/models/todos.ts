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
  reducers: {
    toggle(state: TodosState, index: number) {
      state.dataSource[index].done = !state.dataSource[index].done;
    },
    update(prevState: TodosState, payload) {
      return {
        ...prevState,
        ...payload,
      };
    },
  },
  effects: {
    add(state: TodosState, todo: Todo, actions, globalActions) {
      const dataSource = ([] as any).concat(state.dataSource);
      dataSource.push(todo);
      globalActions.user.setTodos(dataSource.length);
      actions.update({
        dataSource,
      });
    },
    async refresh(state: TodosState, payload, actions, globalActions) {
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
      actions.update({
        dataSource,
      });
    },
    async remove(state: TodosState, index: number, actions, globalActions) {
      await delay(1000);
      const dataSource = ([] as any).concat(state.dataSource);
      dataSource.splice(index, 1);

      globalActions.user.setTodos(dataSource.length);
      actions.update(state);
    },
  },
};

export default todos;
