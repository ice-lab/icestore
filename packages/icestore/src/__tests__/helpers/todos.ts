export default {
  state: [],
  reducers: {
    add(state, todo = {}) {
      return {
        ...state,
        todo: [...state.todo, todo]
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