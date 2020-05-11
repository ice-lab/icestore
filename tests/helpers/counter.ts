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
    decrement: (prevState: CounterState) => prevState.count -= 1,
    reset: () => ({ count: 0 }),
  },
  effects: () => ({
    async asyncIncrement() {
      await delay(100);
      this.increment();
    },

    async asyncDecrement() {
      await delay(100);
      this.decrement();
    },

    async throwError(message = 'Error!') {
      await delay(100);
      throw new Error(message);
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
