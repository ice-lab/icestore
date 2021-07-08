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