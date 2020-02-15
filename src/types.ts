import * as React from 'react';

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

export type Effect = (...args: any) => any;

export type Reducer = (...args: any) => any;

export interface Config {
  state: any;
  reducers: {
    [name: string]: Reducer;
  };
  effects?: {
    [name: string]: Effect;
  };
};
