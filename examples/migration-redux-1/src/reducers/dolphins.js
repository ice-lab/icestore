const INCREMENT = 'dolphins/increment';

export const incrementDolphins = (payload) => ({
  type: INCREMENT,
  payload,
});

export default (state = 0, action) => {
  switch (action.type) {
    case INCREMENT:
      return state + action.payload;
    default:
      return state;
  }
};
