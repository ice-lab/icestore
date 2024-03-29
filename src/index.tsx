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
import { checkModels } from './utils/checkModels';
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
  plugins.push(createProviderPlugin({ context }));
  plugins.push(createReduxHooksPlugin({ context }));
  plugins.push(createModelApisPlugin());

  // https://github.com/ice-lab/icestore/issues/94
  // TODO: fix error & loading plugin immer problem
  const immerBlacklist = [];
  if (!disableLoading) {
    plugins.push(createLoadingPlugin());
    immerBlacklist.push('loading');
  }
  if (!disableError) {
    plugins.push(createErrorPlugin());
    immerBlacklist.push('error');
  }
  if (!disableImmer) {
    plugins.push(createImmerPlugin({ blacklist: immerBlacklist }));
  }

  // TODO: disable in production?
  checkModels(models);

  // compatibility handling
  const wrappedModels = appendReducers(models);

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

interface MapModelToProps<M extends T.ModelConfig> {
  (model: T.ExtractIModelAPIsFromModelConfig<M>): Record<string, any>;
}

export const withModel = <
  M extends T.ModelConfig,
  F extends MapModelToProps<M>,
  C extends T.CreateStoreConfig<{ model: M }>,
>(model: M, mapModelToProps?: F, initConfig?: C) => {
  const modelName = 'model';
  mapModelToProps = (mapModelToProps || ((modelApis) => ({ [modelName]: modelApis }))) as F;
  const store = createStore({ [modelName]: model }, initConfig);
  const { Provider, getModelAPIs } = store;
  const modelApis = getModelAPIs(modelName);
  const withProps = mapModelToProps(modelApis);
  return <R extends ReturnType<F>, P extends R>(Component: React.ComponentType<P>) => {
    return (props: T.Optionalize<P, R>): React.ReactElement => {
      return (
        <Provider>
          <Component
            {...withProps}
            {...props as P}
          />
        </Provider>
      );
    };
  };
};

export default createStore;
export * from './types';
