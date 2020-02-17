import React from 'react';
import ReactDOM from 'react-dom';
import store from './store';
import Todos from './components/Todos';
import TodoAdd from './components/TodoAdd';
import User from './components/User';

const { Provider } = store;

const initialStates = {
  user: {
    dataSource: {
      name: 'Tom',
    },
    auth: true,
    todos: 0,
  },
};

function App() {
  return (
    <Provider initialStates={initialStates}>
      <Todos />
      <TodoAdd />
      <User />
    </Provider>
  );
}

const rootElement = document.getElementById('ice-container');
ReactDOM.render(<App />, rootElement);
