import * as React from 'react';
import { Assign } from 'utility-types';

export type Optionalize<T extends K, K> = Omit<T, keyof K>;

export type PropType<TObj, TProp extends keyof TObj> = TObj[TProp];

export type ReactSetState<S> = React.Dispatch<React.SetStateAction<S>>;

/**
 * @template V Value
 */
export type SplitValueFunction<V> = (v: V) => any;

/**
 * @template P Props
 * @template V Value
 */
export type ContextHookFunction<V> = () => V;

/**
 * @template P Props
 * @template V Value
 */
export type ContextHookTuple<P, V> = [
  React.FunctionComponent<P>,
  ContextHookFunction<V>
];

/**
 * @template P Props
 * @template S SplitValues
 */
export type ContextHookMultipleTuple<
  P,
  S extends SplitValueFunction<any>[]
> = [
  React.FunctionComponent<P>,
  S[0] extends (...args: any[]) => infer U ? ContextHookFunction<U> : never,
  S[1] extends (...args: any[]) => infer U ? ContextHookFunction<U> : never,
  S[2] extends (...args: any[]) => infer U ? ContextHookFunction<U> : never,
  S[3] extends (...args: any[]) => infer U ? ContextHookFunction<U> : never,
  S[4] extends (...args: any[]) => infer U ? ContextHookFunction<U> : never,
  S[5] extends (...args: any[]) => infer U ? ContextHookFunction<U> : never,
  S[6] extends (...args: any[]) => infer U ? ContextHookFunction<U> : never,
  S[7] extends (...args: any[]) => infer U ? ContextHookFunction<U> : never,
  S[8] extends (...args: any[]) => infer U ? ContextHookFunction<U> : never
];

/**
 * @template P Props
 * @template V Value
 * @template S SplitValues
 */
export type ContextHookReturn<
  P,
  V,
  S extends SplitValueFunction<V>[]
> = (S['length'] extends 0
  ? ContextHookTuple<P, V>
  : ContextHookMultipleTuple<P, S>);

  export type ConfigAction<S = any> = (prevState: S, payload?: any, actions?: any, globalActions?: any) => S | Promise<S>;
  export type ConfigEffect<S = any> = (state: S, payload?: any, actions?: any, globalActions?: any) => void | Promise<void>;
  export type ConfigReducer<S = any> = (state: S, payload?: any,) => S;

export interface ConfigActions<S = any> {
  [name: string]: ConfigAction<S>;
}

export interface ConfigEffects<S = any> {
  [name: string]: ConfigEffect<S>;
}

export interface ConfigReducers<S = any> {
  [name: string]: ConfigReducer<S>;
}

export interface Config<S = any> {
  state: S;
  actions?: ConfigActions<S>;
  effects?: ConfigEffects<S>;
  reducers?: ConfigReducers<S>;
};

export interface Configs {
  [namespace: string]: Config;
}

export interface ModelProps<S = any> {
  initialState?: S;
}

export interface FunctionState {
  isLoading: boolean;
  error: Error;
}

export type FunctionsState<Functions> = {
  [K in keyof Functions]?: FunctionState;
}

export type SetFunctionsState<Functions> = ReactSetState<FunctionsState<Functions>>;

export type EffectIdentifier = number;

export type EffectsIdentifier<ConfigActions> = {
  [K in keyof ConfigActions]: EffectIdentifier;
}

export interface EffectPayload {
  payload: any;
  identifier: EffectIdentifier;
}

export type EffectsPayload<A> = {
  [K in keyof A]: EffectPayload;
}

export type SetEffectsPayload<A> = ReactSetState<EffectsPayload<A>>;

export type Actions<A extends ConfigActions> = {
  [K in keyof A]?: (payload?: Parameters<A[K]>[1]) => void;
}

export type ConfigPropTypeState<C extends Config> = PropType<C, 'state'>;
export type ConfigPropTypeActions<C extends Config> = PropType<C, 'actions'>;
export type ConfigPropTypeEffects<C extends Config> = PropType<C, 'effects'>;
export type ConfigPropTypeReducers<C extends Config> = PropType<C, 'reducers'>;
export type ConfigMergedEffects<C extends Config> = Assign<ConfigPropTypeActions<C>, ConfigPropTypeEffects<C>>;
export type ModelEffects<C extends Config> = Actions<ConfigMergedEffects<C>>;
export type ModelActions<C extends Config> = Actions<Assign<ConfigPropTypeReducers<C>, ConfigMergedEffects<C>>>;
export type ModelEffectsState<C extends Config> = FunctionsState<ConfigMergedEffects<C>>;
export type ModelValue<C extends Config> = [ ConfigPropTypeState<C>, ModelActions<C>, ModelEffectsState<C> ];
export type Model<C extends Config> =
  ContextHookReturn<
  ConfigPropTypeState<C>,
  ModelValue<C>,
  [
    (model: ModelValue<C>) => ConfigPropTypeState<C>,
    (model: ModelValue<C>) => ModelActions<C>,
    (model: ModelValue<C>) => ModelEffectsState<C>
  ]
  >;
export type UseModelValue<C extends Config> = [ ConfigPropTypeState<C>, ModelActions<C> ];
