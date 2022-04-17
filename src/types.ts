import * as Redux from 'redux';
import React from 'react';

export type Optionalize<T extends K, K> = Omit<T, keyof K>;

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
    : {}

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

interface UseModelEffectsError<M extends Models = Models, Key extends keyof M = undefined> {
  <K extends keyof M>(name: K): ExtractIModelEffectsErrorFromModelConfig<Key extends undefined ? M[K] : M[Key]>;
}

interface MapModelEffectsErrorToProps<M extends Models = Models, Key extends keyof M = undefined> {
  <K extends keyof M>(effectsLoading: ExtractIModelEffectsErrorFromModelConfig<Key extends undefined ? M[K] : M[Key]>): Record<string, any>;
}

interface WithModelEffectsError<M extends Models = Models, F extends MapModelEffectsErrorToProps<M> = MapModelEffectsErrorToProps<M>> {
  <K extends keyof M>(name: K, mapModelEffectsErrorToProps?: F):
  <R extends ReturnType<F>, P extends R>(Component: React.ComponentType<P>) =>
  (props: Optionalize<P, R>) => React.ReactElement;
}

interface ModelEffectsErrorAPI<M extends Models = Models> {
  useModelEffectsError: UseModelEffectsError<M>;
  withModelEffectsError: WithModelEffectsError<M>;
}

interface UseModelEffectsLoading<M extends Models = Models, Key extends keyof M = undefined> {
  <K extends keyof M>(name: K): ExtractIModelEffectsLoadingFromModelConfig<Key extends undefined ? M[K] : M[Key]>;
}

interface MapModelEffectsLoadingToProps<M extends Models = Models, Key extends keyof M = undefined> {
  <K extends keyof M>(effectsLoading: ExtractIModelEffectsLoadingFromModelConfig<Key extends undefined ? M[K] : M[Key]>): Record<string, any>;
}

interface WithModelEffectsLoading<M extends Models = Models, F extends MapModelEffectsLoadingToProps<M> = MapModelEffectsLoadingToProps<M>> {
  <K extends keyof M>(name: K, mapModelEffectsLoadingToProps?: F):
  <R extends ReturnType<F>, P extends R>(Component: React.ComponentType<P>) =>
  (props: Optionalize<P, R>) => React.ReactElement;
}

interface ModelEffectsLoadingAPI<M extends Models = Models> {
  useModelEffectsLoading: UseModelEffectsLoading<M>;
  withModelEffectsLoading: WithModelEffectsLoading<M>;
}

interface UseModelEffectsState<M extends Models, Key extends keyof M = undefined> {
  <K extends keyof M>(name: K): ExtractIModelEffectsStateFromModelConfig<Key extends undefined ? M[K] : M[Key]>;
}

interface MapModelEffectsStateToProps<M extends Models = Models, Key extends keyof M = undefined> {
  <K extends keyof M>(effectsState: ExtractIModelEffectsStateFromModelConfig<Key extends undefined ? M[K] : M[Key]>): Record<string, any>;
}

interface WithModelEffectsState<M extends Models = Models, F extends MapModelEffectsStateToProps<M> = MapModelEffectsStateToProps<M>> {
  <K extends keyof M>(name: K, mapModelEffectsStateToProps?: F):
  <R extends ReturnType<F>, P extends R>(Component: React.ComponentType<P>) =>
  (props: Optionalize<P, R>) => React.ReactElement;
}

interface ModelEffectsStateAPI<M extends Models = Models> {
  useModelEffectsState: UseModelEffectsState<M>;
  withModelEffectsState: WithModelEffectsState<M>;
}

interface UseModelState<M extends Models = Models, Key extends keyof M = undefined> {
  <K extends keyof M>(name: K): ExtractIModelStateFromModelConfig<Key extends undefined ? M[K] : M[Key]>;
}

interface ModelStateAPI<M extends Models = Models> {
  useModelState: UseModelState<M>;
  getModelState: UseModelState<M>;
}

interface UseModelDispatchers<M extends Models = Models, Key extends keyof M = undefined> {
  <K extends keyof M>(name: K): ExtractIModelDispatchersFromModelConfig<Key extends undefined ? M[K] : M[Key]>;
}

interface MapModelDispatchersToProps<M extends Models = Models, Key extends keyof M = undefined> {
  <K extends keyof M>(dispatchers: ExtractIModelDispatchersFromModelConfig<Key extends undefined ? M[K] : M[Key]>): Record<string, any>;
}

interface WithModelDispatchers<M extends Models = Models, F extends MapModelDispatchersToProps<M> = MapModelDispatchersToProps<M>> {
  <K extends keyof M>(name: K, mapModelDispatchersToProps?: F):
  <R extends ReturnType<F>, P extends R>(Component: React.ComponentType<P>) =>
  (props: Optionalize<P, R>) => React.ReactElement;
}

interface ModelDispathersAPI<M extends Models = Models> {
  useModelDispatchers: UseModelDispatchers<M>;
  getModelDispatchers: UseModelDispatchers<M>;
  withModelDispatchers: WithModelDispatchers<M>;
}

interface UseModel<M extends Models = Models, Key extends keyof M = undefined> {
  <K extends keyof M>(name: K): ExtractIModelFromModelConfig<Key extends undefined ? M[K] : M[Key]>;
}

interface MapModelToProps<M extends Models = Models, Key extends keyof M = undefined> {
  <K extends keyof M>(model: ExtractIModelFromModelConfig<Key extends undefined ? M[K] : M[Key]>): Record<string, any>;
}

interface WithModel<M extends Models = Models, F extends MapModelToProps<M> = MapModelToProps<M>> {
  <K extends keyof M>(name: K, mapModelToProps?: F):
  <R extends ReturnType<F>, P extends R>(Component: React.ComponentType<P>) =>
  (props: Optionalize<P, R>) => React.ReactElement;
}

interface ModelValueAPI<M extends Models = Models> {
  useModel: UseModel<M>;
  getModel: UseModel<M>;
  withModel: WithModel<M>;
}

interface GetModelAPIsValue<M extends Models = Models, K extends keyof M = keyof M> {
  // ModelValueAPI
  useValue: () => ReturnType<UseModel<M, K>>;
  getValue: () => ReturnType<UseModel<M, K>>;
  withValue: <F extends MapModelToProps<M, K>>(f?: F) => ReturnType<WithModel<M, F>>;
  // ModelStateAPI
  useModelState: () => ReturnType<UseModelState<M, K>>;
  getModelState: () => ReturnType<UseModelState<M, K>>;
  // ModelDispathersAPI
  useDispatchers: () => ReturnType<UseModelDispatchers<M, K>>;
  getDispatchers: () => ReturnType<UseModelDispatchers<M, K>>;
  withDispatchers: <F extends MapModelDispatchersToProps<M, K>>(f?: F) => ReturnType<WithModelDispatchers<M, F>>;
  // ModelEffectsLoadingAPI
  useEffectsLoading: () => ReturnType<UseModelEffectsLoading<M, K>>;
  withEffectsLoading: <F extends MapModelEffectsLoadingToProps<M, K>>(f?: F) => ReturnType<WithModelEffectsLoading<M, F>>;
  // ModelEffectsErrorAPI
  useEffectsError: () => ReturnType<UseModelEffectsError<M, K>>;
  withEffectsError: <F extends MapModelEffectsErrorToProps<M, K>>(f?: F) => ReturnType<WithModelEffectsError<M, F>>;
  // ModelEffectsStateAPI
  useModelEffectsState: () => ReturnType<UseModelEffectsState<M>>;
  withModelEffectsState: <F extends MapModelEffectsStateToProps<M, K>>(f?: F) => ReturnType<WithModelEffectsState<M, F>>;
}

interface GetModelAPIs<M extends Models = Models, Key extends keyof M = undefined> {
  <K extends keyof M>(name: K): GetModelAPIsValue<M, Key extends undefined ? K : Key>;
}

type ModelAPI<M extends Models = Models> =
  {
    getModelAPIs: GetModelAPIs<M>;
  } &
  ModelValueAPI<M> &
  ModelStateAPI<M> &
  ModelDispathersAPI<M> &
  ModelEffectsLoadingAPI<M> &
  ModelEffectsErrorAPI<M> &
  ModelEffectsStateAPI<M>;

interface ProviderProps {
  children: any;
  initialStates?: any;
}

interface ProviderPluginAPI {
  Provider: (props: ProviderProps) => JSX.Element;
  context: React.Context<{ store: PresetIcestore }>;
}

export type ExtractIModelAPIsFromModelConfig<M extends ModelConfig> = ReturnType<GetModelAPIs<{ model: M }, 'model'>>;

export type PresetIcestore<
  M extends Models = Models,
  A extends Action = Action,
> = Icestore<M, A> &
ModelAPI<M> &
ProviderPluginAPI;

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
    payload: any,
    rootState?: S,
    meta?: any
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
export interface ThisModelConfig<
  S,
  R extends ModelReducers<S> = {},
  E extends ModelEffects<S> | ((dispatch: IcestoreDispatch) => ModelEffects<S>) = {},
  SS = S,
> {
  name?: string;
  state: S;
  baseReducer?: (state: SS, action: Action) => SS;
  reducers?: R;
  effects?: E extends ModelEffects<S>
    ? E & ThisType<ExtractIModelDispatchersFromReducersObject<R> & ExtractIModelDispatchersFromEffectsObject<E>>
    : (
        dispatch: IcestoreDispatch,
      ) => ModelEffects<S> &
        ThisType<ExtractIModelDispatchersFromReducersObject<R> & ExtractIModelDispatchersFromEffects<E>>;
}

type ReturnModelConfig<
  S,
  R extends ModelReducers<S>,
  E extends ModelEffects<S> | ((dispatch: IcestoreDispatch) => ModelEffects<S>),
  SS,
> = {
  name?: string;
  state: S;
  baseReducer?: (state: SS, action: Action) => SS;
  reducers?: R;
  effects?: E;
};
export function createModel<
  S,
  R extends ModelReducers<S>,
  E extends ModelEffects<S> | ((dispatch: IcestoreDispatch) => ModelEffects<S>),
  SS = S,
>(config: ThisModelConfig<S, R, E, SS>) {
  return config as ReturnModelConfig<S, R, E, SS>;
}
