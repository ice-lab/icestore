import React from 'react';
import * as rhl from "@testing-library/react-hooks";

function createHook(Provider: React.ComponentType<any>, callback: (...args) => any, namespace: string, initialStates?: any) {
  return rhl.renderHook<React.PropsWithChildren<Record<string, any>>, any>(() => callback(namespace), {
    wrapper: (props) => (
      <Provider {...props} initialStates={initialStates}>
        {props.children}
      </Provider>
    ),
  });
}

export default createHook;
