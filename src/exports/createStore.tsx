import React from 'react';
import { Provider as ReduxProvider } from 'react-redux';
import { init } from '../init';
import createLoadingPlugin from '../plugins/loading';
import createImmerPlugin from '../plugins/immer';
import createErrorPlugin from '../plugins/error';
import { convertEffects, convertActions } from './converter';
import appendReducers from './appendReducers';
import createHooks from './createHooks';
import warning from '../utils/warning';

const loading = createLoadingPlugin();
const error = createErrorPlugin();
const immer = createImmerPlugin();

export const createStore = function(models: any, initConfig?: any) {
  const { plugins = [], disableImmer, disableLoading, disableError } =
    initConfig || {};

  if (!disableImmer) {
    plugins.push(immer);
  }
  if (!disableLoading) {
    plugins.push(loading);
  }
  if (!disableError) {
    plugins.push(error);
  }

  const wrappedModels = appendReducers(
    convertEffects(
      convertActions(models),
    ),
  );

  const store = init({
    models: wrappedModels,
    plugins,
  });

  const NO_PROVIDER = '_NP_' as any;
  const context = React.createContext(NO_PROVIDER);

  const Provider = function(props: { children; initialStates? }) {
    const { children, initialStates } = props;
    if (initialStates) {
      warning('initialStates is no longer recommended');
      Object.keys(initialStates).forEach(name => {
        const initialState = initialStates[name];
        if (initialState && store.dispatch[name].setState) {
          store.dispatch[name].setState(initialState);
        }
      });
    }
    return (
      <ReduxProvider store={store} context={context}>
        {children}
      </ReduxProvider>
    );
  };

  const hooks = createHooks(context);

  return {
    ...store,
    ...hooks,
    Provider,
  };
};
