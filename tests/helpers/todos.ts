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
    add(state: TodosState, todo: Todo) {
      state.dataSource.push(todo);
    },
    remove(state: TodosState, index: number) {
      state.dataSource.splice(index, 1);
    },
  },

  effects: (dispatch) => ({
    add(state: TodosState, todo: Todo) {
      this.add(todo);
      dispatch.user.setTodos(state.dataSource.length);
    },

    async delete(state: TodosState, index: number) {
      await delay(1000);
      this.remove(index);
      dispatch.user.setTodos(state.dataSource.length);
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
