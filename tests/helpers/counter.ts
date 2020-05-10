import { delay } from './utils';

export interface CounterState {
  count: number;
}

const counter = {
  state: {
    count: 0,
  },
  reducers: {
    increment: (prevState: CounterState) => prevState.count += 1,
    decrement: (prevState: CounterState) => {
      prevState.count--;
    },
    reset: () => ({ count: 0 }),
  },
  effects: () => ({
    async asyncIncrement() {
      await delay(100);
      this.increment();
    },
    async asyncDecrement(_, rootState) {
      if (rootState.counter.count <= 0) {
        throw new Error('count should be greater than or equal to 0');
      }
      await delay(100);
      this.decrement();
    },
  }),
};

export const counterWithUnsupportEffects = {
  state: {
    a: 1,
  },
  effects: {
    incrementA: (state, value) => {
      return {
        ...state,
        a: state.a + value,
      };
    },
  },
};

export const counterWithUnsupportActions = {
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

export const counterWithNoImmer = {
  state: {
    count: 1,
  },
  reducers: {
    increment: (prevState) => { return prevState.count + 1; },
  },
};

export default counter;
