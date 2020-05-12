import { delay } from './utils';

export interface CounterState {
  count: number;
}

const counter = {
  state: {
    count: 0,
  },
  reducers: {
    increment: (prevState: CounterState, count: number) => prevState.count += count,
    decrement: (prevState: CounterState, count: number) => prevState.count -= count,
    reset: () => ({ count: 0 }),
  },
  effects: () => ({
    async setCount(count) {
      await delay(100);
      this.setState({ count });
    },

    async asyncCallIncrement(count = 1) {
      this.asyncIncrement(count);
    },

    async asyncIncrement(count = 1) {
      await delay(100);
      this.increment(count);
    },

    async asyncDecrement(count = 1) {
      await delay(100);
      this.decrement(count);
    },

    async incrementSome() {
      await this.asyncIncrement(2);
      await this.asyncIncrement(1);
      await this.asyncIncrement(1);
    },

    async throwError(message = 'Error!') {
      await delay(100);
      throw new Error(message);
    },
  }),
};

export const counterCustomSetState = {
  state: {
    count: 0,
  },
  reducers: {
    setState: (prevState: CounterState, payload) => ({
      ...prevState,
      count: payload.count + 1,
    }),
  },
  effects: () => ({
    async setCount(count) {
      await delay(100);
      this.setState({ count });
    },
  }),
};

export const counterWithImmer = {
  state: {
    a: {
      b: {
        c: 0,
      },
    },
    d: {
      b: {
        c: 0,
      },
    },
  },
  reducers: {
    add(state) {
      state.a.b.c += 1;
    },
  },
};

export const counterWithNoImmer = {
  state: {
    a: {
      b: {
        c: 0,
      },
    },
    d: {
      b: {
        c: 0,
      },
    },
  },
  reducers: {
    add(state) {
      return {
        ...state,
        a: {
          ...state.a,
          b: {
            ...state.a.b,
            c: state.a.b.c + 1,
          },
        },
      };
    },
  },
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

export default counter;
