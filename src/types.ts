import * as Redux from 'redux';

export type PropType<TObj, TProp extends keyof TObj> = TObj[TProp];

export interface EffectState {
  isLoading: boolean;
  error: Error;
}

export type EffectsState<Effects> = {
  [K in keyof Effects]: EffectState;
}

export type EffectsLoading<Effects> = {
  [K in keyof Effects]: boolean;
}
export type EffectsError<Effects> = {
  [K in keyof Effects]: {
    error: Error;
    value: number;
  };
}

export type ExtractIcestoreStateFromModels<M extends Models> = {
  [modelKey in keyof M]: M[modelKey]['state']
}

export type IcestoreRootState<M extends Models> = ExtractIcestoreStateFromModels<
M
>

export type ExtractIcestoreDispatcherAsyncFromEffect<
  E
> = E extends () => Promise<infer R>
  ? IcestoreDispatcherAsync<void, void, R>
  : E extends (payload: infer P) => Promise<infer R>
    ? IcestoreDispatcherAsync<P, void, R>
    : E extends (payload: infer P, meta: infer M) => Promise<infer R>
      ? IcestoreDispatcherAsync<P, M, R>
      : IcestoreDispatcherAsync<any, any, any>

export type ExtractIcestoreDispatchersFromEffectsObject<
  effects extends ModelEffects<any>
> = {
  [effectKey in keyof effects]: ExtractIcestoreDispatcherAsyncFromEffect<
  effects[effectKey]
  >
}

export type ExtractIcestoreDispatchersFromEffects<
  effects extends ModelConfig['effects']
> = effects extends ((...args: any[]) => infer R)
  ? R extends ModelEffects<any>
    ? ExtractIcestoreDispatchersFromEffectsObject<R>
    : {}
  : effects extends ModelEffects<any>
    ? ExtractIcestoreDispatchersFromEffectsObject<effects>
    : {}

export type ExtractIcestoreDispatcherFromReducer<R> = R extends () => any
  ? IcestoreDispatcher<void, void>
  : R extends (state: infer S) => infer S
    ? IcestoreDispatcher<void, void>
    : R extends (state: infer S, payload: infer P) => infer S
      ? IcestoreDispatcher<P, void>
      : R extends (state: infer S, payload: infer P, meta: infer M) => infer S
        ? IcestoreDispatcher<P, M>
        : IcestoreDispatcher<any, any>

export type ExtractIcestoreDispatchersFromReducersObject<
  reducers extends ModelReducers<any>
> = {
  [reducerKey in keyof reducers]: ExtractIcestoreDispatcherFromReducer<
  reducers[reducerKey]
  >
}

export type ExtractIcestoreDispatchersFromReducers<
  reducers extends ModelConfig['reducers']
> = ExtractIcestoreDispatchersFromReducersObject<reducers & {}>

export type ExtractIcestoreStateFromModel<M extends ModelConfig> = PropType<M, 'state'>;

export type ExtractIcestoreEffectsFromModel<M extends ModelConfig> = PropType<M, 'effects'>;

export type ExtractIcestoreReducersFromModel<M extends ModelConfig> = PropType<M, 'reducers'>;

export type ExtractIcestoreModelFromModel<M extends ModelConfig> = [
  ExtractIcestoreStateFromModel<M>,
  ExtractIcestoreDispatchersFromModel<M>,
];

export type ExtractIcestoreEffectsErrorFromModel<M extends ModelConfig> = EffectsError<ExtractIcestoreEffectsFromModel<M>>;
export type ExtractIcestoreEffectsLoadingFromModel<M extends ModelConfig> = EffectsLoading<ExtractIcestoreEffectsFromModel<M>>;
export type ExtractIcestoreEffectsStateFromModel<M extends ModelConfig> = EffectsState<ExtractIcestoreEffectsFromModel<M>>;

export type ExtractIcestoreDispatchersFromModel<
  M extends ModelConfig
> = ExtractIcestoreDispatchersFromReducers<ExtractIcestoreReducersFromModel<M>> &
ExtractIcestoreDispatchersFromEffects<ExtractIcestoreEffectsFromModel<M>>

export type ExtractIcestoreDispatchersFromModels<M extends Models> = {
  [modelKey in keyof M]: ExtractIcestoreDispatchersFromModel<M[modelKey]>
}

export type IcestoreDispatcher<P = void, M = void> = ([P] extends [void]
  ? ((...args: any[]) => Action<any, any>)
  : [M] extends [void]
    ? ((payload: P) => Action<P, void>)
    : (payload: P, meta: M) => Action<P, M>) &
((action: Action<P, M>) => Redux.Dispatch<Action<P, M>>) &
((action: Action<P, void>) => Redux.Dispatch<Action<P, void>>)

export type IcestoreDispatcherAsync<P = void, M = void, R = void> = ([P] extends [void]
  ? ((...args: any[]) => Promise<R>)
  : [M] extends [void]
    ? ((payload: P) => Promise<R>)
    : (payload: P, meta: M) => Promise<R>) &
((action: Action<P, M>) => Promise<R>) &
((action: Action<P, void>) => Promise<R>)

export type IcestoreDispatch<M extends Models | void = void> = (M extends Models
  ? ExtractIcestoreDispatchersFromModels<M>
  : {
    [key: string]: {
      [key: string]: IcestoreDispatcher | IcestoreDispatcherAsync;
    };
	  }) &
(IcestoreDispatcher | IcestoreDispatcherAsync) &
(Redux.Dispatch<any>) // for library compatability

export interface Icestore<
  M extends Models = Models,
  A extends Action = Action
> extends Redux.Store<IcestoreRootState<M>, A> {
  name: string;
  replaceReducer(nextReducer: Redux.Reducer<IcestoreRootState<M>, A>): void;
  dispatch: IcestoreDispatch<M>;
  getState(): IcestoreRootState<M>;
  model(model: Model): void;
  subscribe(listener: () => void): Redux.Unsubscribe;
}

export interface Action<P = any, M = any> {
  type: string;
  payload?: P;
  meta?: M;
}

export type EnhancedReducer<S, P = object, M = object> = (
  state: S,
  payload: P,
  meta: M
) => S

export interface EnhancedReducers {
  [key: string]: EnhancedReducer<any>;
}

export interface ModelReducers<S = any> {
  [key: string]: (state: S, payload: any, meta?: any) => S;
}

interface ModelEffects<S> {
  [key: string]: (
    this: { [key: string]: (payload?: any, meta?: any) => Action<any, any> },
    payload: any,
    rootState: S
  ) => void;
}

export interface Models {
  [key: string]: ModelConfig;
}

export type ModelHook = (model: Model) => void

export type Validation = [boolean | undefined, string]

export interface Model<S = any, SS = S> extends ModelConfig<S, SS> {
  name: string;
  reducers: ModelReducers<S>;
}

export interface ModelConfig<S = any, SS = S> {
  name?: string;
  state: S;
  baseReducer?: (state: SS, action: Action) => SS;
  reducers?: ModelReducers<S>;
  effects?:
  | ModelEffects<any>
  | ((dispatch: IcestoreDispatch) => ModelEffects<any>);
}

export interface PluginFactory extends Plugin {
  create(plugin: Plugin): Plugin;
}

export interface Plugin<M extends Models = Models, A extends Action = Action> {
  config?: InitConfig<M>;
  onInit?: () => void;
  onStoreCreated?: (store: Icestore<M, A>) => void;
  onModel?: ModelHook;
  middleware?: Middleware;

  // exposed
  exposed?: {
    [key: string]: any;
  };
  validate?(validations: Validation[]): void;
  storeDispatch?(action: Action, state: any): Redux.Dispatch<any> | undefined;
  storeGetState?(): any;
  dispatch?: IcestoreDispatch<M>;
  effects?: Record<string, any>;
  createDispatcher?(modelName: string, reducerName: string): void;
}

export interface RootReducers {
  [type: string]: Redux.Reducer<any, Action>;
}

export interface DevtoolOptions {
  disabled?: boolean;
  [key: string]: any;
}

export interface InitConfigRedux<S = any> {
  initialState?: S;
  reducers?: ModelReducers;
  enhancers?: Redux.StoreEnhancer<any>[];
  middlewares?: Middleware[];
  rootReducers?: RootReducers;
  combineReducers?: (
    reducers: Redux.ReducersMapObject
  ) => Redux.Reducer<any, Action>;
  createStore?: Redux.StoreCreator;
  devtoolOptions?: DevtoolOptions;
}

export interface InitConfig<M extends Models = Models> {
  name?: string;
  models?: M;
  plugins?: Plugin[];
  redux?: InitConfigRedux;
}

export interface Config<M extends Models = Models> extends InitConfig {
  name: string;
  models: M;
  plugins: Plugin[];
  redux: ConfigRedux;
}

export interface Middleware<
  DispatchExt = {},
  S = any,
  D extends Redux.Dispatch = Redux.Dispatch
> {
  (api: Redux.MiddlewareAPI<D, S>): (
    next: Redux.Dispatch<Action>
  ) => (action: any, state?: any) => any;
}

export interface ConfigRedux {
  initialState?: any;
  reducers: ModelReducers;
  enhancers: Redux.StoreEnhancer<any>[];
  middlewares: Middleware[];
  rootReducers?: RootReducers;
  combineReducers?: (
    reducers: Redux.ReducersMapObject
  ) => Redux.Reducer<any, Action>;
  createStore?: Redux.StoreCreator;
  devtoolOptions?: DevtoolOptions;
}

export interface IcestoreClass {
  config: Config;
  models: Model[];
  addModel(model: Model): void;
}

declare global {
  interface Window {
    __REDUX_DEVTOOLS_EXTENSION_COMPOSE__?: any;
  }
}
