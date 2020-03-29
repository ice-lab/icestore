import React from 'react';
import { Provider as ReduxProvider } from 'react-redux';
import { Plugin } from '../typings';
import warning from '../utils/warning';

interface ProviderConfig {
  context: any;
}

export default ({ context }: ProviderConfig): Plugin => {
  return {
    onStoreCreated(store: any) {
      const Provider = function(props: { children; initialStates? }) {
        const { children, initialStates } = props;
        if (initialStates) {
          warning('initialStates is no longer recommended');
          Object.keys(initialStates).forEach(name => {
            const initialState = initialStates[name];
            if (initialState && store.dispatch[name].setState) {
              store.dispatch[name].setState(initialState);
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

