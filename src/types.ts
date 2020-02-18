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

export type ModelConfigAction<S = any> = (prevState: S, payload?: any, actions?: any, globalActions?: any) => S | Promise<S>;

export interface ModelConfigActions<S = any> {
  [name: string]: ModelConfigAction<S>;
}

export interface ModelConfig<S = any> {
  state: S;
  actions?: ModelConfigActions<S>;
};

export interface ModelConfigs {
  [namespace: string]: ModelConfig;
}

export interface ModelProps<S = any> {
  initialState?: S;
}

export interface FunctionState {
  isLoading: boolean;
  error: Error;
}

export type FunctionsState<Functions> = {
  [K in keyof Functions]: FunctionState;
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

export type ActionsPayload<ConfigActions> = {
  [K in keyof ConfigActions]: ActionPayload;
}

export type SetActionsPayload<ConfigActions> = ReactSetState<ActionsPayload<ConfigActions>>;

export type Actions<ConfigActions extends ModelConfigActions> = {
  [K in keyof ConfigActions]: (payload?: Parameters<ConfigActions[K]>[1]) => void;
}

export type GetModelConfigState<M extends ModelConfig> = PropType<M, 'state'>;
export type GetModelConfigActions<M extends ModelConfig> = PropType<M, 'actions'>;
export type ModelActions<M extends ModelConfig> = Actions<GetModelConfigActions<M>>;
export type ModelActionsState<M extends ModelConfig> = FunctionsState<GetModelConfigActions<M>>;
export type UseModelValue<M extends ModelConfig> = [ GetModelConfigState<M>, ModelActions<M>, ModelActionsState<M> ];
export type Model<M extends ModelConfig> =
  ContextHookReturn<
    GetModelConfigState<M>,
    UseModelValue<M>,
    [
      (model: UseModelValue<M>) => GetModelConfigState<M>,
      (model: UseModelValue<M>) => ModelActions<M>,
      (model: UseModelValue<M>) => ModelActionsState<M>
    ]
  >;
