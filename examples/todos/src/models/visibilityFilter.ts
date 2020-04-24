export const VisibilityFilters = {
  ALL: 'ALL',
  COMPLETED: 'COMPLETED',
  ACTIVE: 'ACTIVE',
};

const visibilityFilter = {
  state: VisibilityFilters.ALL,
  reducers: {
    setState(prevState, nextState) {
      return nextState;
    },
  },
};

export default visibilityFilter;
