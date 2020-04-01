import * as Redux from 'redux';

export type Optionalize<T extends K, K> = Omit<T, keyof K>;

export type PropType<Obj, Prop extends keyof Obj> = Obj[Prop];

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

export type ExtractIModelDispatcherAsyncFromEffect<
  E
> = E extends () => Promise<infer R>
  ? IcestoreDispatcherAsync<void, void, R>
  : E extends (payload: infer P) => Promise<infer R>
    ? IcestoreDispatcherAsync<P, void, R>
    : E extends (payload: infer P, meta: infer M) => Promise<infer R>
      ? IcestoreDispatcherAsync<P, M, R>
      : IcestoreDispatcherAsync<any, any, any>

export type ExtractIModelDispatchersFromEffectsObject<
  effects extends ModelEffects<any>
> = {
  [effectKey in keyof effects]: ExtractIModelDispatcherAsyncFromEffect<
  effects[effectKey]
  >
}

export type ExtractIModelDispatchersFromEffects<
  effects extends ModelConfig['effects']
> = effects extends ((...args: any[]) => infer R)
  ? R extends ModelEffects<any>
    ? ExtractIModelDispatchersFromEffectsObject<R>
    : {}
  : effects extends ModelEffects<any>
    ? ExtractIModelDispatchersFromEffectsObject<effects>
    : {}

export type ExtractIModelDispatcherFromReducer<R> = R extends () => any
  ? IcestoreDispatcher<void, void>
  : R extends (state: infer S) => infer S
    ? IcestoreDispatcher<void, void>
    : R extends (state: infer S, payload: infer P) => infer S
      ? IcestoreDispatcher<P, void>
      : R extends (state: infer S, payload: infer P, meta: infer M) => infer S
        ? IcestoreDispatcher<P, M>
        : IcestoreDispatcher<any, any>

export type ExtractIModelDispatchersFromReducersObject<
  reducers extends ModelReducers<any>
> = {
  [reducerKey in keyof reducers]: ExtractIModelDispatcherFromReducer<
  reducers[reducerKey]
  >
}

export type ExtractIModelDispatchersFromReducers<
  reducers extends ModelConfig['reducers']
> = ExtractIModelDispatchersFromReducersObject<reducers & {}>

export type ExtractIModelStateFromModelConfig<M extends ModelConfig> = PropType<M, 'state'>;

export type ExtractIModelEffectsFromModelConfig<M extends ModelConfig> = PropType<M, 'effects'>;

export type ExtractIModelReducersFromModelConfig<M extends ModelConfig> = PropType<M, 'reducers'>;

export type ExtractIModelFromModelConfig<M extends ModelConfig> = [
  ExtractIModelStateFromModelConfig<M>,
  ExtractIModelDispatchersFromModelConfig<M>,
];

export type ExtractIModelEffectsErrorFromModelConfig<M extends ModelConfig> = EffectsError<
ExtractIModelDispatchersFromEffects<ExtractIModelEffectsFromModelConfig<M>>
>;
export type ExtractIModelEffectsLoadingFromModelConfig<M extends ModelConfig> = EffectsLoading<
ExtractIModelDispatchersFromEffects<ExtractIModelEffectsFromModelConfig<M>>
>;
export type ExtractIModelEffectsStateFromModelConfig<M extends ModelConfig> = EffectsState<
ExtractIModelDispatchersFromEffects<ExtractIModelEffectsFromModelConfig<M>>
>;

export type ExtractIModelDispatchersFromModelConfig<
  M extends ModelConfig
> = ExtractIModelDispatchersFromReducers<ExtractIModelReducersFromModelConfig<M>> &
ExtractIModelDispatchersFromEffects<ExtractIModelEffectsFromModelConfig<M>>

export type ExtractIcestoreDispatchersFromModels<M extends Models> = {
  [modelKey in keyof M]: ExtractIModelDispatchersFromModelConfig<M[modelKey]>
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

export interface EffectsErrorPluginAPI<M extends Models = Models> {
  useModelEffectsError<K extends keyof M>(name: K): ExtractIModelEffectsErrorFromModelConfig<M[K]>;
  withModelEffectsError<
    K extends keyof M,
    F extends (effectsError: ExtractIModelEffectsErrorFromModelConfig<M[K]>) => Record<string, any>
  >(name: K, mapModelEffectsErrorToProps?: F):
  <R extends ReturnType<F>, P extends R>(Component: React.ComponentType<P>) =>
  (props: Optionalize<P, R>) => React.ReactElement;
}

export interface EffectsLoadingPluginAPI<M extends Models = Models> {
  useModelEffectsLoading<K extends keyof M>(name: K): ExtractIModelEffectsLoadingFromModelConfig<M[K]>;
  withModelEffectsLoading<
    K extends keyof M,
    F extends (effectsLoading: ExtractIModelEffectsLoadingFromModelConfig<M[K]>) => Record<string, any>
  >(name: K, mapModelEffectsLoadingToProps?: F):
  <R extends ReturnType<F>, P extends R>(Component: React.ComponentType<P>) =>
  (props: Optionalize<P, R>) => React.ReactElement;
}

export interface UseModelEffectsState<M extends Models> {
  <K extends keyof M>(name: K): ExtractIModelEffectsStateFromModelConfig<M[K]>;
}

export interface WithModelEffectsState<M extends Models> {
  <
    K extends keyof M,
    F extends (effectsState: ExtractIModelEffectsStateFromModelConfig<M[K]>) => Record<string, any>
  >(name: K, mapModelEffectsStateToProps?: F):
  <R extends ReturnType<F>, P extends R>(Component: React.ComponentType<P>) =>
  (props: Optionalize<P, R>) => React.ReactElement;
}

export interface EffectsStatePluginAPI<M extends Models = Models> {
  useModelEffectsState: UseModelEffectsState<M>;
  useModelActionsState: UseModelEffectsState<M>;
  withModelEffectsState: WithModelEffectsState<M>;
  withModelActionsState: WithModelEffectsState<M>;
}

export interface UseModelDispatchers<M extends Models = Models> {
  <K extends keyof M>(name: K): ExtractIModelDispatchersFromModelConfig<M[K]>;
}

export interface WithModelDispatchers<M extends Models = Models> {
  <
    K extends keyof M,
    F extends (model: ExtractIModelDispatchersFromModelConfig<M[K]>) => Record<string, any>
  >(name: K, mapModelDispatchersToProps?: F):
  <R extends ReturnType<F>, P extends R>(Component: React.ComponentType<P>) =>
  (props: Optionalize<P, R>) => React.ReactElement;
}

export interface ModelPluginAPI<M extends Models = Models> {
  useModel<K extends keyof M>(name: K): ExtractIModelFromModelConfig<M[K]>;
  useModelState<K extends keyof M>(name: K): ExtractIModelStateFromModelConfig<M[K]>;
  useModelDispatchers: UseModelDispatchers<M>;
  useModelActions: UseModelDispatchers<M>;
  getModel<K extends keyof M>(name: K): ExtractIModelFromModelConfig<M[K]>;
  getModelState<K extends keyof M>(name: K): ExtractIModelStateFromModelConfig<M[K]>;
  getModelDispatchers<K extends keyof M>(name: K): ExtractIModelDispatchersFromModelConfig<M[K]>;
  withModel<
    K extends keyof M,
    F extends (model: ExtractIModelFromModelConfig<M[K]>) => Record<string, any>
  >(name: K, mapModelToProps?: F):
  <R extends ReturnType<F>, P extends R>(Component: React.ComponentType<P>) =>
  (props: Optionalize<P, R>) => React.ReactElement;
  withModelDispatchers: WithModelDispatchers<M>;
  withModelActions: WithModelDispatchers<M>;
}

export interface ProviderPluginAPI {
  Provider: ({ children }: {
    children: any;
  }) => JSX.Element;
}

export type PresetIcestore<
  M extends Models = Models,
  A extends Action = Action,
> = Icestore<M, A> &
ModelPluginAPI<M> &
ProviderPluginAPI &
EffectsLoadingPluginAPI<M> &
EffectsErrorPluginAPI<M> &
EffectsStatePluginAPI<M>;

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

export interface PrsetConfig {
  disableImmer?: boolean;
  disableLoading?: boolean;
  disableError?: boolean;
  initialState?: any;
}

export type CreateStoreConfig<M extends Models = Models> = InitConfig<M> & PrsetConfig;

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

declare global {
  interface Window {
    __REDUX_DEVTOOLS_EXTENSION_COMPOSE__?: any;
  }
}

/** @deprecated */
export type ConfigPropTypeState<M extends ModelConfig> = ExtractIModelStateFromModelConfig<M>;
export type ConfigPropTypeEffects<M extends ModelConfig> = ExtractIModelEffectsFromModelConfig<M>;
export type ConfigPropTypeReducers<M extends ModelConfig> = ExtractIModelReducersFromModelConfig<M>;
export type ModelActions<M extends ModelConfig> = ExtractIModelDispatchersFromModelConfig<M>;
export type ModelEffectsState<M extends ModelConfig> = ExtractIModelEffectsStateFromModelConfig<M>;
export type UseModelValue<M extends ModelConfig> = ExtractIModelFromModelConfig<M>;
