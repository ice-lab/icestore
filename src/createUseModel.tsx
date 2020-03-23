import { useState, useEffect } from 'react';
import Dispatcher from './dispatcher';

export default function<Models>(useContext: any) {
  type Model = { [key in keyof Models]: any };
  function useModel<T extends keyof Model, U>(
    namespace: T,
  ): Model[T] {
    type RetState = Model[T];
    const dispatcher = useContext() as Dispatcher;
    const data = dispatcher.data[namespace];
    if (!dispatcher.callbacks[namespace]) {
      dispatcher.callbacks[namespace] = new Set();
    }
    const callbacks = dispatcher.callbacks[namespace];
    const [state, setState] = useState<RetState>(() => data);

    useEffect(() => {
      const handler = (e: any) => {
        setState(e);
      };

      callbacks.add(handler);
      return () => {
        callbacks.delete(handler);
      };
    }, [callbacks, namespace]);

    return state;
  }

  return useModel;
}
