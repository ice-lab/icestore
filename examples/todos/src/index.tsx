import React from 'react';
import ReactDOM from 'react-dom';
import store from './store';
import TodoList from './components/TodoList';
import AddTodo from './components/AddTodo';

const { Provider } = store;

function App() {
  return (
    <Provider>
      <AddTodo />
      <TodoList />
    </Provider>
  );
}

const rootElement = document.getElementById('root');
ReactDOM.render(<App />, rootElement);
