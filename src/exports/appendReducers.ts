export default function(originModels: any) {
  const models = {};
  Object.keys(originModels).forEach(function(name) {
    const model = originModels[name];
    if (!model.reducers) {
      model.reducers = {};
    }
    if (!model.reducers.update) {
      model.reducers.update = (state, payload) => ({
        ...state,
        ...payload
      });
    }
    if (!model.reducers.setState) {
      model.reducers.setState = (state, payload) => payload;
    }
    models[name] = model;
  });
  return models;
}
