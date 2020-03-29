import * as Redux from 'redux';
import * as T from './typings';
import isListener from './utils/isListener';

const composeEnhancersWithDevtools = (
  devtoolOptions: T.DevtoolOptions = {},
): any => {
  const { disabled, ...options } = devtoolOptions;
  /* istanbul ignore next */
  return !disabled &&
    typeof window === 'object' &&
    window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__
    ? window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__(options)
    : Redux.compose;
};

export default function({
  redux,
  models,
}: {
  redux: T.ConfigRedux;
  models: T.Model[];
}) {
  const combineReducers = redux.combineReducers || Redux.combineReducers;
  const createStore: Redux.StoreCreator = redux.createStore || Redux.createStore;
  const initialState: any =
    typeof redux.initialState !== 'undefined' ? redux.initialState : {};

  this.reducers = redux.reducers;

  // combine models to generate reducers
  this.mergeReducers = (nextReducers: T.ModelReducers = {}) => {
    // merge new reducers with existing reducers
    this.reducers = { ...this.reducers, ...nextReducers };
    if (!Object.keys(this.reducers).length) {
      // no reducers, just return state
      return (state: any) => state;
    }
    return combineReducers(this.reducers);
  };

  this.createModelReducer = (model: T.Model) => {
    const modelBaseReducer = model.baseReducer;
    const modelReducers = {};
    for (const modelReducer of Object.keys(model.reducers || {})) {
      const action = isListener(modelReducer)
        ? modelReducer
        : `${model.name}/${modelReducer}`;
      modelReducers[action] = model.reducers[modelReducer];
    }
    const combinedReducer = (state: any = model.state, action: T.Action) => {
      if (typeof modelReducers[action.type] === 'function') {
        return modelReducers[action.type](state, action.payload, action.meta);
      }
      return state;
    };

    this.reducers[model.name] = !modelBaseReducer
      ? combinedReducer
      : (state: any, action: T.Action) =>
        combinedReducer(modelBaseReducer(state, action), action);
  };
  
  // initialize model reducers
  for (const model of models) {
    this.createModelReducer(model);
  }

  this.createRootReducer = (
    rootReducers: T.RootReducers = {},
  ): Redux.Reducer<any, T.Action> => {
    const mergedReducers: Redux.Reducer<any> = this.mergeReducers();
    if (Object.keys(rootReducers).length) {
      return (state, action) => {
        const rootReducerAction = rootReducers[action.type];
        if (rootReducers[action.type]) {
          return mergedReducers(rootReducerAction(state, action), action);
        }
        return mergedReducers(state, action);
      };
    }
    return mergedReducers;
  };

  const rootReducer = this.createRootReducer(redux.rootReducers);

  const middlewares = Redux.applyMiddleware(...redux.middlewares);
  const enhancers = composeEnhancersWithDevtools(redux.devtoolOptions)(
    ...redux.enhancers,
    middlewares,
  );

  this.store = createStore(rootReducer, initialState, enhancers);

  return this;
}
