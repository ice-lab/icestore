import { createModel } from '@ice/store';

export const VisibilityFilters = {
  ALL: 'ALL',
  COMPLETED: 'COMPLETED',
  ACTIVE: 'ACTIVE',
};

const visibilityFilter = createModel({
  state: VisibilityFilters.ALL,
  reducers: {
    setState(prevState, nextState) {
      return nextState;
    },
  },
});

export default visibilityFilter;
