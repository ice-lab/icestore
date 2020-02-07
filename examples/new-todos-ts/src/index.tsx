import React from 'react';
import ReactDOM from 'react-dom';
import { createStore } from './createStore';

// Use a model to define your store:
const todosModel = {
  state: [
    {
      title: 'a',
      done: false
    }
  ],
  actions: {
    add(preState, todo) {
      // preState.push(todo);
      return [ ...preState, todo ];
    },
  }
};

const storeModels = {
  todos: todosModel,
};

// Create the store
const { Provider, useStore } = createStore(storeModels);

// Consume model
function Button() {
  const { add } = useStore('todos');
  function onClick() {
    add({
      title: 'Testing',
      done: false,
    });
  }
  return <button onClick={onClick}>+</button>;
}

function Count() {
  const { data } = useStore('todos');
  return <span>{data.length}</span>;
}

// Wrap your application
function App() {
  return (
    <Provider>
      <div>
        <Count />
        <Button />
      </div>
      <div>
        <Count />
      </div>
    </Provider>
  );
}

const rootElement = document.getElementById('ice-container');
ReactDOM.render(<App />, rootElement);
