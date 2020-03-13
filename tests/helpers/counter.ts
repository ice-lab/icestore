import { delay } from './utils';

export interface CounterState {
  count: number;
}

const counter = {
  state: {
    count: 0,
  },
  reducers: {
    increment: (prevState: CounterState) => ({ count: prevState.count + 1 }),
    decrement: (prevState: CounterState) => ({ count: prevState.count - 1 }),
    reset: () => ({ count: 0 }),
  },
  effects: {
    async decrementAsync(state, payload, actions) {
      if (state.count <= 0) {
        throw new Error('count should be greater than or equal to 0');
      }
      await delay(1000);
      actions.decrement();
    },
  },
};

export default counter;