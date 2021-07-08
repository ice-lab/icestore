export default {
  state: {
    todos: [],
  },
  reducers: {
    add(state, todo = {}) {
      return {
        ...state,
        todos: [...state.todos, todo]
      }
    },
  },
  effects: (dispatch) => ({
    add(todo) {
      dispatch.counter.asyncIncrement();
    },
    decreCounter() {
      dispatch.counter.asyncDecrement(1);
    },
  }),
};