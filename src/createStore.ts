import React from 'react';
import thunkMiddleware from 'redux-thunk';
import { init } from './init';
import createProviderPlugin from './plugins/provider';
import createReduxHooksPlugin from './plugins/reduxHooks';
import createModelHooksPlugin from './plugins/modelHooks';
import createEffectsStateHooksPlugin from './plugins/effectsStateHooks';
import createImmerPlugin from './plugins/immer';
import createLoadingPlugin from './plugins/loading';
import createErrorPlugin from './plugins/error';
import { convertEffects, convertActions } from './utils/converter';
import appendReducers from './utils/appendReducers';

export const createStore = function(models: any, initConfig?: any): any {
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

  const store = init({
    models: wrappedModels,
    plugins,
    redux: {
      ...redux,
      middlewares: [thunkMiddleware]
    },
  });

  return store;
};
