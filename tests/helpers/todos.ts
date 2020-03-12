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
      globalActions.user.setTodos(dataSource.length);
    },

    async delete(state: TodosState, index: number, actions, globalActions) {
      await delay(1000);
      const dataSource = [].concat(state.dataSource);
      dataSource.splice(index, 1);

      actions.update({ dataSource });
      globalActions.user.setTodos(dataSource.length);
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
