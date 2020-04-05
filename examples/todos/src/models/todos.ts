import { delay } from '../utils';
import store, { RootDispatch } from '../store';

export interface Todo {
  name: string;
  done?: boolean;
}

export interface TodosState {
  dataSource: Todo[];
}

const model = {
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
    add(state: TodosState, todo: Todo) {
      state.dataSource.push(todo);
    },
    remove(state: TodosState, index: number) {
      state.dataSource.splice(index, 1);
    },
  },
  effects: (dispatch: RootDispatch) => ({
    // this will run after "add" reducer finished
    add(todo: Todo) {
      dispatch.user.setTodos(store.getModelState('todos').dataSource.length);
    },
    async refresh() {
      await delay(2000); // wait for data to load
      const dataSource: Todo[] = [
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

      // pass the result to a local reducer
      // update is a built-in reducer
      (this as any).update({
        dataSource,
      });

      dispatch.user.setTodos(dataSource.length);
    },
    async remove(index: number) {
      await delay(1000);
      dispatch.user.setTodos(store.getModelState('todos').dataSource.length);
    },
  }),
};

export default model;
