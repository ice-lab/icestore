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
    add(store, todo: Todo) {
      this.addTodo(todo);
      dispatch.user.setTodos(store.getModelState('todos').dataSource.length);
    },

    async delete(store, index: number) {
      await delay(1000);
      this.removeTodo(index);
      dispatch.user.setTodos(store.getModelState('todos').dataSource.length);
    },
  }),
};

export const todosWithUnsupportEffects = {
  state: {
    a: 1,
  },
  // actions: {
  //   incrementA: (state, value) => {
  //     return {
  //       ...state,
  //       a: state.a + value,
  //     };
  //   },
  // },
  // old version define effects
  effects: {
    incrementA: (state, value) => {
      return {
        ...state,
        a: state.a + value,
      };
    },
  },
};

export default todos;
