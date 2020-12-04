import actionTypes from '../actionTypes';

const { SET_STATE } = actionTypes;

export default function(originModels: any) {
  const models = {};
  Object.keys(originModels).forEach(function(name) {
    const model = originModels[name];
    if (!model.reducers) {
      model.reducers = {};
    }
    if (!model.reducers.setState) {
      model.reducers.setState = (state, payload) => ({
        ...state,
        ...payload,
      });
    }
    if (!model.reducers[SET_STATE]) {
      model.reducers[SET_STATE] = (state, payload) => payload;
    }
    models[name] = model;
  });
  return models;
}
