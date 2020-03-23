import React from 'react';
import ReactDOM from 'react-dom';
import store from './store';
import Todos from './components/Todos';
import TodoAdd from './components/TodoAdd';
import User from './components/User';
import Car from './components/Car';

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
    <Provider>
      <Todos />
      <TodoAdd />
      <User />
      <Car />
    </Provider>
  );
}

const rootElement = document.getElementById('root');
ReactDOM.render(<App />, rootElement);
