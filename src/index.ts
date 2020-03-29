import React from 'react';
import thunkMiddleware from 'redux-thunk';
import Icestore from './icestore';
import * as T from './typings';
import mergeConfig from './utils/mergeConfig';
import createProviderPlugin from './plugins/provider';
import createReduxHooksPlugin from './plugins/reduxHooks';
import createModelHooksPlugin from './plugins/modelHooks';
import createEffectsStateHooksPlugin from './plugins/effectsStateHooks';
import createImmerPlugin from './plugins/immer';
import createLoadingPlugin from './plugins/loading';
import createErrorPlugin from './plugins/error';
import { convertEffects, convertActions } from './utils/converter';
import appendReducers from './utils/appendReducers';

/**
 * global createModel
 *
 * creates a model for the given object
 * this is for autocomplete purposes only
 * returns the same object that was received as argument
 */
export function createModel<S = any, M extends T.ModelConfig<S> = any>(
  model: M,
) {
  return model;
}

// incrementer used to provide a store name if none exists
let count = 0;

/**
 * createOriginStore
 *
 * generates a Icestore
 * with a set configuration
 * @param config
 */
export const createIcestore = (initConfig: T.InitConfig = {}): T.Icestore => {
  const name = initConfig.name || count.toString();
  count += 1;
  const config: T.Config = mergeConfig({ ...initConfig, name });
  return new Icestore(config).init();
};

/**
 * createStore
 *
 * generates a preset Icestore
 * @param models
 * @param initConfig
 */
export const createStore = (models: any, initConfig?: any): any => {
  const { plugins = [], redux = {}, disableImmer, disableLoading, disableError } =
    initConfig || {};
  const middlewares = redux.middlewares || [];

  const NO_PROVIDER = '_NP_' as any;
  const context = React.createContext(NO_PROVIDER);

  // defaults middlewares
  middlewares.push(thunkMiddleware);

  // defaults plugins
  plugins.push(createProviderPlugin({context}));
  plugins.push(createReduxHooksPlugin({context}));
  plugins.push(createModelHooksPlugin());
  plugins.push(createEffectsStateHooksPlugin());

  const loading = createLoadingPlugin();
  const error = createErrorPlugin();
  const immer = createImmerPlugin();
  if (!disableImmer) {
    plugins.push(immer);
  }
  if (!disableLoading) {
    plugins.push(loading);
  }
  if (!disableError) {
    plugins.push(error);
  }

  // compatibility handling
  const wrappedModels = appendReducers(
    convertEffects(
      convertActions(models),
    ),
  );

  const store = createIcestore({
    models: wrappedModels,
    plugins,
    redux: {
      ...redux,
      middlewares: [thunkMiddleware]
    },
  });

  return store;
};

export default createStore;
