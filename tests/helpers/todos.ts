
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
    update(prevState: TodosState, payload) {
      return {
        ...prevState,
        ...payload,
      };
    },
  },

  effects: {
    add(state: TodosState, todo: Todo, actions, globalActions) {
      const dataSource = [].concat(state.dataSource);
      dataSource.push(todo);
      actions.update({
        dataSource,
      });
    },
  },
};

export const todosWithAction = {
  state: {
    a: 1,
  },
  actions: {
    incrementA: (state, value) => {
      return {
        ...state,
        a: state.a + value,
      };
    },
  },
};
export default todos;
