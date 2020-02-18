import * as React from 'react';

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

export interface ConfigActions<S = any> {
  [name: string]: ConfigAction<S>;
}

export interface Config<S = any> {
  state: S;
  actions?: ConfigActions<S>;
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

export type ActionIdentifier = number;

export type ActionsIdentifier<ConfigActions> = {
  [K in keyof ConfigActions]: ActionIdentifier;
}

export interface ActionPayload {
  payload: any;
  identifier: ActionIdentifier;
}

export type ActionsPayload<A> = {
  [K in keyof A]: ActionPayload;
}

export type SetActionsPayload<A> = ReactSetState<ActionsPayload<A>>;

export type Actions<A extends ConfigActions> = {
  [K in keyof A]?: (payload?: Parameters<A[K]>[1]) => void;
}

export type ConfigPropTypeState<C extends Config> = PropType<C, 'state'>;
export type ConfigPropTypeActions<C extends Config> = PropType<C, 'actions'>;
export type ModelActions<C extends Config> = Actions<ConfigPropTypeActions<C>>;
export type ModelActionsState<C extends Config> = FunctionsState<ConfigPropTypeActions<C>>;
export type ModelValue<C extends Config> = [ ConfigPropTypeState<C>, ModelActions<C>, ModelActionsState<C> ];
export type Model<C extends Config> =
  ContextHookReturn<
    ConfigPropTypeState<C>,
    ModelValue<C>,
    [
      (model: ModelValue<C>) => ConfigPropTypeState<C>,
      (model: ModelValue<C>) => ModelActions<C>,
      (model: ModelValue<C>) => ModelActionsState<C>
    ]
  >;
export type UseModelValue<C extends Config> = [ ConfigPropTypeState<C>, ModelActions<C> ];
