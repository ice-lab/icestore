import React from 'react';
import * as rhl from '@testing-library/react-hooks';

function createHook(Provider, callback, namespace, initialStates?: any) {
  return rhl.renderHook(() => callback(namespace), {
    wrapper: (props) => (
      <Provider {...props} initialStates={initialStates}>
        {props.children}
      </Provider>
    ),
  });
}

export default createHook;
