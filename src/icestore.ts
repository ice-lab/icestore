import pluginFactory from './pluginFactory';
import dispatchPlugin from './plugins/dispatch';
import effectsPlugin from './plugins/effects';
import createRedux from './redux';
import * as T from './types';
import validate from './utils/validate';

const corePlugins: T.Plugin[] = [dispatchPlugin, effectsPlugin];

/**
 * Icestore class
 *
 * an instance of Icestore generated by "init"
 */
export default class Icestore {
  protected config: T.Config;

  protected models: T.Model[];

  private plugins: T.Plugin[] = [];

  private pluginFactory: T.PluginFactory;

  constructor(config: T.Config) {
    this.config = config;
    this.pluginFactory = pluginFactory(config);
    for (const plugin of corePlugins.concat(this.config.plugins)) {
      this.plugins.push(this.pluginFactory.create(plugin));
    }
    // preStore: middleware, model hooks
    this.forEachPlugin('middleware', middleware => {
      this.config.redux.middlewares.push(middleware);
    });
  }

  public forEachPlugin(method: string, fn: (content: any) => void) {
    for (const plugin of this.plugins) {
      if (plugin[method]) {
        fn(plugin[method]);
      }
    }
  }

  public getModels = (models: T.Models): T.Model[] => {
    return Object.keys(models).map((name: string) => ({
      name,
      ...models[name],
      reducers: models[name].reducers || {},
    }));
  };

  public addModel(model: T.Model) {
    validate([
      [!model, 'model config is required'],
      [typeof model.name !== 'string', 'model "name" [string] is required'],
      [
        model.state === undefined && model.baseReducer === undefined,
        `model(${model.name}) "state" is required`,
      ],
      [
        model.baseReducer !== undefined &&
					typeof model.baseReducer !== 'function',
        `model(${model.name}) "baseReducer" must be a function`,
      ],
    ]);
    // run plugin model subscriptions
    this.forEachPlugin('onModel', onModel => onModel(model));
  }

  public init() {
    // collect all models
    this.models = this.getModels(this.config.models);
    for (const model of this.models) {
      this.addModel(model);
    }
    // create a redux store with initialState
    // merge in additional extra reducers
    const redux = createRedux.call(this, {
      redux: this.config.redux,
      models: this.models,
    });

    const icestore = {
      name: this.config.name,
      ...redux.store,
      // dynamic loading of models with `replaceReducer`
      model: (model: T.Model) => {
        this.addModel(model);
        redux.mergeReducers(redux.createModelReducer(model));
        redux.store.replaceReducer(
          redux.createRootReducer(this.config.redux.rootReducers),
        );
        redux.store.dispatch({ type: '@@redux/REPLACE ' });
      },
    };

    this.forEachPlugin('onStoreCreated', onStoreCreated => {
      const returned = onStoreCreated(icestore);
      // if onStoreCreated returns an object value
      // merge its returned value onto the store
      if (returned) {
        Object.keys(returned || {}).forEach(key => {
          icestore[key] = returned[key];
        });
      }
    });

    return icestore;
  }
}
