import React from 'react';
import { Provider as ReduxProvider } from 'react-redux';
import * as T from '../typings';
import warning from '../utils/warning';

interface ProviderConfig {
  context: React.Context<null>;
}

export default ({ context }: ProviderConfig): T.Plugin => {
  return {
    onStoreCreated(store: any) {
      const Provider = function(props: { children; initialStates? }) {
        const { children, initialStates } = props;
        if (initialStates) {
          warning('`initialStates` API has been detected, please use `createStore(model, { initialState })` instead. \n\n\n https://github.com/ice-lab/icestore/blob/master/docs/upgrade-guidelines.md#initialstate');
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

