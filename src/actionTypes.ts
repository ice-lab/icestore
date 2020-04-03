const randomString = () =>
  Math.random()
    .toString(36)
    .substring(7)
    .split('')
    .join('.');

const ActionTypes = {
  SET_STATE: `@@icestore/SET_STATE${/* #__PURE__ */ randomString()}`,
};

export default ActionTypes;
