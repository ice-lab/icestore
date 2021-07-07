import isFunction from 'lodash.isfunction';

/**
 * checkModels
 * 
 * @param originModels
 */
export function checkModels(originModels: any) {
  Object.keys(originModels).forEach(function(name) {
    const model = originModels[name];

    // 1.1.0-1.2.0: effects: {} -> effects: () => ({})
    if (model.effects && !isFunction(model.effects)) {
      throw new Error(`Model(${name}): Defining effects as objects has been detected, please use \`{ effects: () => ({ effectName: () => {} }) }\` instead. \n\n\n Visit https://github.com/ice-lab/icestore/blob/master/docs/upgrade-guidelines.md#define-model-effects to learn about how to upgrade.`);
    }

    // <1.1.0: actions: {} -> effects: () => ({})
    if (model.actions) {
      throw new Error(`Model(${name}): The actions field has been detected, please use \`reducers\` and \`effects\` instead. Visit https://github.com/ice-lab/icestore/blob/master/docs/upgrade-guidelines.md#define-model-actions to learn about how to upgrade.`);
    }
  });
}