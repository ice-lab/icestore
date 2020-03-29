import { delay } from '../utils';
import store from '../store';

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
    add(state, todo) {
      state.dataSource.push(todo);
    },
    remove(state, index) {
      state.dataSource.splice(index, 1);
    }
  },
  effects: (dispatch) => ({
    add() {
      dispatch.user.setTodos(store.getModelState('todos').dataSource.length);
    },
    async refresh() {
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
      this.update({
        dataSource,
      });

      dispatch.user.setTodos(dataSource.length);
    },
    async remove() {
      await delay(1000);
      dispatch.user.setTodos(store.getModelState('todos').dataSource.length);
    },
  }),
};

export default todos;
