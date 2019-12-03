export interface Stores {
  [namespace: string]: any;
}

interface ActionProps {
  loading?: boolean;
  error?: boolean;
  disableLoading?: boolean;
}

export type Store<W> = {
  [T in keyof W]: W[T] extends Function ? W[T] & ActionProps: W[T];
}

type NonFunctionPropertyNames<T> = { [K in keyof T]: T[K] extends Function ? never : K }[keyof T];

export type State<T> = Pick<T, NonFunctionPropertyNames<T>>;

export interface Ctx {
  action: {
    name: string;
    arguments: any[];
  };
  store: {
    namespace: any;
    getState: () => object;
  };
}

export interface Middleware {
  (ctx: Ctx, next: Promise<any>): any;
}

export interface ComposeFunc {
  (): Promise<any>;
  loading?: boolean;
  disableLoading?: boolean;
  error?: any;
}

