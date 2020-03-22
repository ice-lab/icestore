import { useState, useEffect, useRef } from 'react';
import isEqual from 'lodash.isequal';
import Dispatcher from './dispatcher';

export default function<Models>(useContext: any) {
  type Model = { [key in keyof Models]: any };
  function useModel<T extends keyof Model, U>(
    namespace: T,
    updater?: (model: Model[T]) => U,
  ): typeof updater extends undefined
    ? Model[T]
    : ReturnType<NonNullable<typeof updater>> {
    type RetState = typeof updater extends undefined
      ? Model[T]
      : ReturnType<NonNullable<typeof updater>>;
    const dispatcher = useContext() as Dispatcher;
    const data = dispatcher.data![namespace];
    if (!dispatcher.callbacks[namespace]) {
      dispatcher.callbacks[namespace] = new Set();
    }
    const callbacks = dispatcher.callbacks[namespace];

    const updaterRef = useRef(updater);
    updaterRef.current = updater;
    const [state, setState] = useState<RetState>(() =>
      updaterRef.current ? updaterRef.current(data) : data,
    );
    const lastState = useRef<any>(state);

    useEffect(() => {
      const handler = (e: any) => {
        if (updater && updaterRef.current) {
          const ret = updaterRef.current(e);
          if (!isEqual(ret, lastState.current)) {
            lastState.current = ret;
            setState(ret);
          }
        } else {
          setState(e);
        }
      };

      callbacks.add(handler);
      return () => {
        callbacks.delete(handler);
      };
    }, [callbacks, namespace, updater]);

    return state;
  }

  return useModel;
}
