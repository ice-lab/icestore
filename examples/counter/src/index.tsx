import React from 'react';
import ReactDOM from 'react-dom';
import { createStore } from '@ice/store';

const delay = (time) => new Promise((resolve) => setTimeout(() => resolve(), time));

// 1️⃣ Use a model to define your store
const counter = {
  state: 0,
  reducers: {
    increment:(prevState) => prevState + 1,
    decrement:(prevState) => prevState - 1,
  },
  effects: {
    async decrementAsync(state, payload, actions) {
      await delay(1000);
      actions.decrement();
    },
  },
};

const models = {
  counter,
};

// 2️⃣ Create the store
const store = createStore(models);

// 3️⃣ Consume model
const { useModel } = store;
function Counter() {
  const [ count, actions ] = useModel('counter');
  const { increment, decrementAsync } = actions;
  return (
    <div>
      <span>{count}</span>
      <button type="button" onClick={increment}>+</button>
      <button type="button" onClick={decrementAsync}>-</button>
    </div>
  );
}

// 4️⃣ Wrap your components with Provider
const { Provider } = store;
function App() {
  return (
    <Provider>
      <Counter />
    </Provider>
  );
}

const rootElement = document.getElementById('root');
ReactDOM.render(<App />, rootElement);
