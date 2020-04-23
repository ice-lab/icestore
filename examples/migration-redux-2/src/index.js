import React from 'react';
import ReactDOM from 'react-dom';
import { createStore } from '@ice/store';
import { Provider } from 'react-redux';

import sharks from './models/sharks';
import dolphins from './reducers/dolphins';
import App from './App';

const store = createStore(
  { sharks },
  {
    redux: {
      reducers: {
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
