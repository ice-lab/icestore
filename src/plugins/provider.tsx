import React from 'react';
import { Provider as ReduxProvider } from 'react-redux';
import * as T from '../types';
import warning from '../utils/warning';
import actionTypes from '../actionTypes';

const { SET_STATE } = actionTypes;

interface ProviderConfig {
  context: React.Context<null>;
}

export default ({ context }: ProviderConfig): T.Plugin => {
  return {
    onStoreCreated(store: any) {
      const Provider = function(props: { children; initialStates?; }) {
        const { children, initialStates } = props;
        if (initialStates) {
          Object.keys(initialStates).forEach(name => {
            const initialState = initialStates[name];
            if (initialState && store.dispatch[name][SET_STATE]) {
              store.dispatch[name][SET_STATE](initialState);
            }
          });
        }
        return (
          <ReduxProvider store={store} context={context}>
            {children}
          </ReduxProvider>
        );
      };
      return { Provider };
    },
  };
};

