import React from 'react';
import thunkMiddleware from 'redux-thunk';
import Icestore from './icestore';
import * as T from './types';
import mergeConfig from './utils/mergeConfig';
import createProviderPlugin from './plugins/provider';
import createReduxHooksPlugin from './plugins/reduxHooks';
import createModelApisPlugin from './plugins/modelApis';
import createImmerPlugin from './plugins/immer';
import createLoadingPlugin from './plugins/loading';
import createErrorPlugin from './plugins/error';
import { convertEffects, convertActions } from './utils/converter';
import appendReducers from './utils/appendReducers';

// incrementer used to provide a store name if none exists
let count = 0;

/**
 * createOriginStore
 *
 * generates a Icestore with a set configuration
 * @param config
 */
const init = <M extends T.Models>(initConfig: T.InitConfig<M> = {}): T.Icestore<M> => {
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
export const createStore = <M extends T.Models, C extends T.CreateStoreConfig<M>>(models: M, initConfig?: C): T.PresetIcestore<M> => {
  const {
    disableImmer,
    disableLoading,
    disableError,
    plugins = [],
    redux = {},
  } = initConfig || {};
  const middlewares = redux.middlewares || [];

  const context = React.createContext(null);

  // defaults middlewares
  middlewares.push(thunkMiddleware);

  // defaults plugins
  plugins.push(createProviderPlugin({context}));
  plugins.push(createReduxHooksPlugin({context}));
  plugins.push(createModelApisPlugin());

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
      middlewares,
    },
  });

  return store as T.PresetIcestore<M>;
};

export const withModel = function(model, initConfig) {
  const store = createStore(model, initConfig);
  const { Provider } = store;
  return function(Component) {
    return function(props): React.ReactElement {
      return (
        <Provider>
          <Component {...props} />
        </Provider>
      );
    };
  };
};

export default createStore;
export * from './types';
