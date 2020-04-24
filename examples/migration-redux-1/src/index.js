import React from 'react';
import ReactDOM from 'react-dom';
import { createStore } from '@ice/store';
import { Provider } from 'react-redux';

import sharks from './reducers/sharks';
import dolphins from './reducers/dolphins';
import App from './App';

const store = createStore(
  {},
  {
    redux: {
      reducers: {
        sharks,
        dolphins,
      },
    },
  },
);

const Root = () => (
  <Provider store={store}>
    <App />
  </Provider>
);

ReactDOM.render(<Root />, document.querySelector('#root'));
