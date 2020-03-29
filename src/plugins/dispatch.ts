import * as T from '../typings';

/**
 * Dispatch Plugin
 *
 * generates dispatch[modelName][actionName]
 */
const dispatchPlugin: T.Plugin = {
  exposed: {
    // required as a placeholder for store.dispatch
    storeDispatch(action: T.Action, state: any) {
      console.warn('Warning: store not yet loaded');
    },

    storeGetState() {
      console.warn('Warning: store not yet loaded');
    },

    /**
     * dispatch
     *
     * both a function (dispatch) and an object (dispatch[modelName][actionName])
     * @param action T.Action
     */
    dispatch(action: T.Action) {
      return this.storeDispatch(action);
    },

    /**
     * createDispatcher
     *
     * genereates an action creator for a given model & reducer
     * @param modelName string
     * @param reducerName string
     */
    createDispatcher(modelName: string, reducerName: string) {
      return async (payload?: any, meta?: any): Promise<any> => {
        const action: T.Action = { type: `${modelName}/${reducerName}` };
        if (typeof payload !== 'undefined') {
          action.payload = payload;
        }
        if (typeof meta !== 'undefined') {
          action.meta = meta;
        }
        return this.dispatch(action);
      };
    },
  },

  onStoreCreated(store: any) {
    this.storeDispatch = store.dispatch;
    this.storeGetState = store.getState;
    return { dispatch: this.dispatch };
  },

  // generate action creators for all model.reducers
  onModel(model: T.Model) {
    this.dispatch[model.name] = {};
    if (!model.reducers) {
      return;
    }
    for (const reducerName of Object.keys(model.reducers)) {
      this.validate([
        [
          !!reducerName.match(/\/.+\//),
          `Invalid reducer name (${model.name}/${reducerName})`,
        ],
        [
          typeof model.reducers[reducerName] !== 'function',
          `Invalid reducer (${model.name}/${reducerName}). Must be a function`,
        ],
      ]);
      this.dispatch[model.name][reducerName] = this.createDispatcher.apply(
        this,
        [model.name, reducerName],
      );
    }
  },
};

export default dispatchPlugin;
