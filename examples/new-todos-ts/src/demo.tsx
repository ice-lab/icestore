import React, { useEffect } from 'react';
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
  reducers: {
    add(prevState, todo) {
      // prevState.push(todo);
      return [ ...prevState, todo ];
    },
    setState(prevState, todos) {
      return todos;
    }
  },
  effects: {
    async refresh(actions) {
      const newState = await new Promise(resolve =>
        setTimeout(() => {
          resolve([
            {
              title: 'react',
            },
            {
              title: 'vue',
              done: true,
            },
            {
              title: 'angular',
            },
          ]);
        }, 1000),
      );
      actions.setState(newState);
    }
  }
};

const storeModels = {
  todos: todosModel,
};

// Create the store
const { Provider, useStore } = createStore(storeModels);

// Consume model
function Button() {
  const [, { add }] = useStore('todos');
  function onClick() {
    add({
      title: 'Testing',
      done: false,
    });
  }
  return <button onClick={onClick}>+</button>;
}

function Count() {
  const [data] = useStore('todos');
  return <span>{data.length}</span>;
}

function Main() {
  const [, { refresh }] = useStore('todos');
  useEffect(() => {
    refresh();
  }, []);

  return (
    <div>
      <div>
        <Count />
        <Button />
      </div>
      <div>
        <Count />
      </div>
    </div>
  );
}

// Wrap your application
function App() {
  return (
    <Provider>
      <Main />
    </Provider>
  );
}

const rootElement = document.getElementById('ice-container');
ReactDOM.render(<App />, rootElement);
