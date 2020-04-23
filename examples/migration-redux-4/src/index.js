import React from 'react';
import ReactDOM from 'react-dom';
import store from './store';

import App from './App';

const Root = () => (
  <store.Provider>
    <App />
  </store.Provider>
);

ReactDOM.render(<Root />, document.querySelector('#root'));
