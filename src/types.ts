import * as Redux from 'redux';

type Optionalize<T extends K, K> = Omit<T, keyof K>;

type PropType<Obj, Prop extends keyof Obj> = Obj[Prop];

interface EffectState {
  isLoading: boolean;
  error: Error;
}

type EffectsState<Effects> = {
  [K in keyof Effects]: EffectState;
}

type EffectsLoading<Effects> = {
  [K in keyof Effects]: boolean;
}
type EffectsError<Effects> = {
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

type ExtractIModelDispatcherAsyncFromEffect<
  E
> = E extends () => Promise<infer R>
  ? IcestoreDispatcherAsync<void, void, R>
  : E extends (payload: infer P) => Promise<infer R>
    ? IcestoreDispatcherAsync<P, void, R>
    : E extends (payload: infer P, rootState: any) => Promise<infer R>
      ? IcestoreDispatcherAsync<P, void, R>
      : E extends (payload: infer P, rootState: any, meta: infer M) => Promise<infer R>
        ? IcestoreDispatcherAsync<P, M, R>
        : IcestoreDispatcherAsync<any, any, any>

type ExtractIModelDispatchersFromEffectsObject<
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
    : effects extends ConfigEffects<any> ?
      OldModelEffects<any> : {};

type ExtractIModelDispatcherFromReducer<R> = R extends () => any
  ? IcestoreDispatcher<void, void>
  : R extends (state: infer S) => infer S
    ? IcestoreDispatcher<void, void>
    : R extends (state: infer S, payload: infer P) => (infer S | void)
      ? IcestoreDispatcher<P, void>
      : R extends (state: infer S, payload: infer P, meta: infer M) => (infer S | void)
        ? IcestoreDispatcher<P, M>
        : IcestoreDispatcher<any, any>

interface DefaultIModelDispatchersFromReducersObject {
  setState: IcestoreDispatcher<any, any>;
}

type ExtractIModelDispatchersFromReducersObject<
  reducers extends ModelReducers<any>
> = {
  [reducerKey in keyof reducers]: ExtractIModelDispatcherFromReducer<
  reducers[reducerKey]
  >;
} & DefaultIModelDispatchersFromReducersObject;

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

type IcestoreDispatcher<P = void, M = void> = ([P] extends [void]
  ? ((...args: any[]) => Action<any, any>)
  : [M] extends [void]
    ? ((payload: P) => Action<P, void>)
    : (payload: P, meta: M) => Action<P, M>) &
((action: Action<P, M>) => Redux.Dispatch<Action<P, M>>) &
((action: Action<P, void>) => Redux.Dispatch<Action<P, void>>)

type IcestoreDispatcherAsync<P = void, M = void, R = void> = ([P] extends [void]
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

interface EffectsErrorPluginAPI<M extends Models = Models> {
  useModelEffectsError<K extends keyof M>(name: K): ExtractIModelEffectsErrorFromModelConfig<M[K]>;
  withModelEffectsError<
    K extends keyof M,
    F extends (effectsError: ExtractIModelEffectsErrorFromModelConfig<M[K]>) => Record<string, any>
  >(name: K, mapModelEffectsErrorToProps?: F):
  <R extends ReturnType<F>, P extends R>(Component: React.ComponentType<P>) =>
  (props: Optionalize<P, R>) => React.ReactElement;
}

interface EffectsLoadingPluginAPI<M extends Models = Models> {
  useModelEffectsLoading<K extends keyof M>(name: K): ExtractIModelEffectsLoadingFromModelConfig<M[K]>;
  withModelEffectsLoading<
    K extends keyof M,
    F extends (effectsLoading: ExtractIModelEffectsLoadingFromModelConfig<M[K]>) => Record<string, any>
  >(name: K, mapModelEffectsLoadingToProps?: F):
  <R extends ReturnType<F>, P extends R>(Component: React.ComponentType<P>) =>
  (props: Optionalize<P, R>) => React.ReactElement;
}

interface UseModelEffectsState<M extends Models> {
  <K extends keyof M>(name: K): ExtractIModelEffectsStateFromModelConfig<M[K]>;
}

interface WithModelEffectsState<M extends Models> {
  <
    K extends keyof M,
    F extends (effectsState: ExtractIModelEffectsStateFromModelConfig<M[K]>) => Record<string, any>
  >(name: K, mapModelEffectsStateToProps?: F):
  <R extends ReturnType<F>, P extends R>(Component: React.ComponentType<P>) =>
  (props: Optionalize<P, R>) => React.ReactElement;
}

interface EffectsStatePluginAPI<M extends Models = Models> {
  useModelEffectsState: UseModelEffectsState<M>;

  /**
   * @deprecated use `useModelEffectsState` instead
   */
  useModelActionsState: UseModelEffectsState<M>;
  withModelEffectsState: WithModelEffectsState<M>;

  /**
   * @deprecated use `withModelEffectsState` instead
   */
  withModelActionsState: WithModelEffectsState<M>;
}

interface UseModelDispatchers<M extends Models = Models> {
  <K extends keyof M>(name: K): ExtractIModelDispatchersFromModelConfig<M[K]>;
}

interface WithModelDispatchers<M extends Models = Models> {
  <
    K extends keyof M,
    F extends (model: ExtractIModelDispatchersFromModelConfig<M[K]>) => Record<string, any>
  >(name: K, mapModelDispatchersToProps?: F):
  <R extends ReturnType<F>, P extends R>(Component: React.ComponentType<P>) =>
  (props: Optionalize<P, R>) => React.ReactElement;
}

interface ModelPluginAPI<M extends Models = Models> {
  useModel<K extends keyof M>(name: K): ExtractIModelFromModelConfig<M[K]>;
  useModelState<K extends keyof M>(name: K): ExtractIModelStateFromModelConfig<M[K]>;
  useModelDispatchers: UseModelDispatchers<M>;

  /**
   * @deprecated use `useModelDispatchers` instead.
   */
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

  /**
   * @deprecated use `withModelDispatchers` instead.
   */
  withModelActions: WithModelDispatchers<M>;
}

interface ProviderProps {
  children: any;
  initialStates?: any;
}

interface ProviderPluginAPI {
  Provider: (props: ProviderProps) => JSX.Element;
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

export interface ModelReducers<S = any> {
  [key: string]: (state: S, payload: any, meta?: any) => S;
}

export interface ModelEffects<S> {
  [key: string]: (
    this: { [key: string]: (payload?: any, meta?: any) => Action<any, any> },
    payload: any,
    rootState: S,
    meta: any
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
  reducers?: ModelReducers<S> | ConfigReducers;
  effects?:
  | ModelEffects<any>
  | ((dispatch: IcestoreDispatch) => ModelEffects<any>)
  | ConfigEffects;

  /**
   * @deprecated use `effects` instead.
   */
  actions?: ConfigActions<S>;
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
  initialStates?: S;
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
  initialStates?: any;
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

/**
 * @deprecated
 */
export type ConfigAction<S = any> = (prevState: S, payload?: any, actions?: any, globalActions?: any) => S | Promise<S>;
/**
 * @deprecated
 */
export type ConfigEffect<S = any> = (state: S, payload?: any, actions?: any, globalActions?: any) => void | Promise<void>;
/**
 * @deprecated
 */
export type ConfigReducer<S = any> = (state: S, payload?: any,) => S;
/**
 * @deprecated use `ModelEffects` instead
 */
export interface ConfigEffects<S = any> {
  [name: string]: ConfigEffect<S>;
}
/**
 * @deprecated
 */
export interface ConfigReducers<S = any> {
  [name: string]: ConfigReducer<S>;
}
/**
 * @deprecated
 */
export interface ConfigActions<S = any> {
  [name: string]: ConfigAction<S>;
}
/**
 * @deprecated
 */
export type Actions<A extends ConfigEffects> = {
  [K in keyof A]: (payload?: Parameters<A[K]>[1]) => void;
}
/**
 * @deprecated use `ExtractIModelStateFromModelConfig` instead
 */
export type ConfigPropTypeState<C extends ModelConfig> = PropType<C, 'state'>;
/**
 * @deprecated
 */
export type ConfigPropTypeActions<C extends ModelConfig> = PropType<C, 'actions'>;
/**
 * @deprecated use `ExtractIModelEffectsFromModelConfig` instead
 */
export type ConfigPropTypeEffects<C extends ModelConfig> = PropType<C, 'effects'>;
/**
 * @deprecated use `ExtractIModelReducersFromModelConfig` instead
 */
export type ConfigPropTypeReducers<C extends ModelConfig> = PropType<C, 'reducers'>;
/**
 * @deprecated
 */
export type ConfigMergedEffects<C extends ModelConfig> = ConfigPropTypeActions<C> & ConfigPropTypeEffects<C>;
/**
 * @deprecated use `ExtractIModelDispatchersFromEffects` instead
 */
export type OldModelEffects<C extends ModelConfig> = Actions<ConfigMergedEffects<C>>;
/**
 * @deprecated use `ExtractIModelDispatchersFromModelConfig` instead
 */
export type ModelActions<C extends ModelConfig> = Actions<ConfigPropTypeReducers<C> & ConfigPropTypeEffects<C>>;
/**
 * @deprecated use `ExtractIModelEffectsStateFromModelConfig` instead
 */
export type ModelEffectsState<C extends ModelConfig> = ExtractIModelEffectsStateFromModelConfig<C>;
/**
 * @deprecated
 */
export type ModelValue<C extends ModelConfig> = [ ConfigPropTypeState<C>, ModelActions<C>, ModelEffectsState<C> ];
/**
 * @deprecated use `ExtractIModelFromModelConfig` instead
 */
export type UseModelValue<C extends ModelConfig> = [ ConfigPropTypeState<C>, ModelActions<C> ];
