export default {
  state: [],
  reducers: {
    add(state, todo = {}) {
      state.push(todo);
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