import React from 'react';
import ReactDOM from 'react-dom';
import store from './store';
import User from './components/User';
import Product from './components/Product';

const { Provider } = store;

function App() {
  return (
    <Provider>
      <User title="User's name" />
      <Product title="Product's title" />
    </Provider>
  );
}

const rootElement = document.getElementById('root');
ReactDOM.render(<App />, rootElement);
