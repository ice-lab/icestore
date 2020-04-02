import isFunction from 'lodash.isfunction';
import warning from './warning';

/**
 * convertEffects
 *
 * Compatible with 1.1.0 ~ 1.2.0
 * effects: {} => effects: () => ({})
 * @param originModels
 */
export function convertEffects(originModels: any) {
  const models = {};
  Object.keys(originModels).forEach(function(name) {
    const model = originModels[name];
    const originEffects = model.effects;
    if (originEffects && !isFunction(originEffects)) {
      warning(`Model(${name}): Defining effects as objects has been detected, please use \`{ effects: () => ({ effectName: () => {} }) }\` instead. \n\n\n https://github.com/ice-lab/icestore/blob/master/docs/upgrade-guidelines.md#define-model-effects`);
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
 * convertActions
 *
 * Compatible with 1.0.0 ~ 1.1.0
 * actions: {} => effects: () => ({})
 * @param originModels
 */
export function convertActions(originModels: any) {
  const models = {};
  const setState = '__actionSetState__';
  Object.keys(originModels).forEach(function(name) {
    const model = originModels[name];
    const actions = model.actions;
    if (actions) {
      warning(`Model(${name}): The actions field has been detected, please use \`reducers\` and \`effects\` instead.`);
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
