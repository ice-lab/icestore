import { delay } from './utils';

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
    addTodo(state: TodosState, todo: Todo) {
      state.dataSource.push(todo);
    },
    removeTodo(state: TodosState, index: number) {
      state.dataSource.splice(index, 1);
    },
  },

  effects: (dispatch) => ({
    add(todo, rootState, { store }) {
      this.addTodo(todo);
      dispatch.user.setTodos(store.getModelState('todos').dataSource.length);
    },

    async delete(index, rootState, { store }) {
      await delay(1000);
      this.removeTodo(index);
      dispatch.user.setTodos(store.getModelState('todos').dataSource.length);
    },
  }),
};

export default todos;
