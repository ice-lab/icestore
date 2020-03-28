import isFunction from 'lodash.isfunction';
import warning from './warning';

/**
 * Compatible with 1.1.0 ~ 1.2.0
 *
 * effects: {} => effects: () => ({})
 */
export function convertEffects(originModels: any) {
  const models = {};
  Object.keys(originModels).forEach(function(name) {
    const model = originModels[name];
    const originEffects = model.effects;
    if (originEffects && !isFunction(originEffects)) {
      warning('Defining effects as objects is not recommended.');
      model.effects = (dispatch: any) => {
        const effects = {};
        Object.keys(originEffects).forEach(function(key) {
          const originEffect = originEffects[key];
          effects[key] = (payload: any, rootState: any) => originEffect(
            rootState[name],
            payload,
            dispatch[name],
            dispatch,
          );
        });
        return effects;
      };
    }
    models[name] = model;
  });
  return models;
}

/**
 * Compatible with 1.0.0 ~ 1.1.0
 *
 * actions: {} => effects: () => ({})
 */
export function convertActions(originModels: any) {
  const models = {};
  const setState = '__actionSetState__';
  Object.keys(originModels).forEach(function(name) {
    const model = originModels[name];
    const actions = model.actions;
    if (actions) {
      warning('The actions field is no longer recommended for the following reasons: https://github.com/ice-lab/icestore/issues/66');
      if (!model.reducers) {
        model.reducers = {};
      }
      model.reducers[setState] = (state, payload) => payload;
      model.effects = function(dispatch: any) {
        const effects = {};
        Object.keys(actions).forEach(function(key) {
          const originAction = actions[key];
          effects[key] = async function(payload: any, rootState: any) {
            const result = await originAction(
              rootState[name],
              payload,
              dispatch[name],
              dispatch,
            );
            dispatch[name][setState](result);
          };
        });
        return effects;
      };
    }
    models[name] = model;
  });
  return models;
}
