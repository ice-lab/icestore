import React from 'react';
import ReactDOM from 'react-dom';
import store from './store';
import Todos from './components/Todos';
import TodoAdd from './components/TodoAdd';
import User from './components/User';
import Car from './components/Car';
import Product from './components/Product';

const initialStates = {
  user: {
    dataSource: {
      name: 'Tom',
    },
    auth: true,
    todos: 5,
  },
};

const { Provider } = store;

function App() {
  return (
    <Provider initialStates={initialStates}>
      <Todos />
      <TodoAdd />
      <User />
      <Car />
      <Product title="Product's title" />
    </Provider>
  );
}

const rootElement = document.getElementById('root');
ReactDOM.render(<App />, rootElement);
