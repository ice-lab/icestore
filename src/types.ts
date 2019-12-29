export type Optionalize<T extends K, K> = Omit<T, keyof K>;
export type NonFunctionPropertyNames<T> = { [K in keyof T]: T[K] extends Function ? never : K }[keyof T];

export interface ActionProps {
  loading?: boolean;
  error?: Error;
  disableLoading?: boolean;
}

export interface Action extends ActionProps {
  (): Promise<any>;
}

export type State<T> = Pick<T, NonFunctionPropertyNames<T>>;

export type Store<W> = {
  [T in keyof W]: W[T] extends Function ? W[T] & ActionProps: W[T];
}

export interface Ctx {
  action: {
    name: string;
    arguments: any[];
  };
  store: {
    namespace: string;
    getState: () => object;
  };
}

export interface Middleware {
  (ctx: Ctx, next: Promise<any>): any;
}
