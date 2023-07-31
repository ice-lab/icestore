/* tslint-disable member-ordering */
import * as T from '../types';

/**
 * Effects Plugin
 *
 * Plugin for handling async actions
 */
const effectsPlugin: T.Plugin = {
  exposed: {
    // expose effects for access from dispatch plugin
    effects: {},
  },

  // add effects to dispatch so that dispatch[modelName][effectName] calls an effect
  onModel(model: T.Model): void {
    if (!model.effects) {
      return;
    }

    const effects =
      typeof model.effects === 'function'
        ? model.effects(this.dispatch)
        : model.effects;

    this.validate([
      [
        typeof effects !== 'object',
        `Invalid effects from Model(${model.name}), effects should return an object`,
      ],
    ]);

    for (const effectName of Object.keys(effects)) {
      this.validate([
        [
          !!effectName.match(/\//),
          `Invalid effect name (${model.name}/${effectName})`,
        ],
        [
          typeof effects[effectName] !== 'function',
          `Invalid effect (${model.name}/${effectName}). Must be a function`,
        ],
      ]);

      // provide this.reducer() for effects
      this.effects[`${model.name}/${effectName}`] = effects[effectName].bind(
        this.dispatch[model.name],
      );

      // add effect to dispatch
      // is assuming dispatch is available already... that the dispatch plugin is in there
      this.dispatch[model.name][effectName] = this.createDispatcher.apply(
        this,
        [model.name, effectName],
      );
      // tag effects so they can be differentiated from normal actions
      this.dispatch[model.name][effectName].isEffect = true;
    }
  },

  // process async/await actions
  middleware(store) {
    return next => async (action: T.Action) => {
      // async/await acts as promise middleware
      if (action.type in this.effects) {
        // effects that share a name with a reducer are called after their reducer counterpart
        await next(action);
        return this.effects[action.type](
          action.payload,
          store.getState(),
          action.meta,
        );
      }
      return next(action);
    };
  },
};

export default effectsPlugin;
