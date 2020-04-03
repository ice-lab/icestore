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
      const Provider = function(props: { children; initialStates?; initialState? }) {
        const { children, initialStates, initialState } = props;
        const states = initialState || initialStates;
        if (states) {
          if (initialStates) {
            warning('`initialStates` API has been detected, please use `initialState` instead. \n\n\n Visit https://github.com/ice-lab/icestore/blob/master/docs/upgrade-guidelines.md#initialstate to learn about how to upgrade.');
          }
          Object.keys(states).forEach(name => {
            const state = states[name];
            if (state && store.dispatch[name][SET_STATE]) {
              store.dispatch[name][SET_STATE](state);
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

