import React from 'react';
import ReactDOM from 'react-dom';
import { createStore, createModel } from '../../../src';
import 'react-app-polyfill/ie11';
import 'react-app-polyfill/stable';

const delay = (time) => new Promise((resolve) => setTimeout(() => resolve(), time));

// 1️⃣ Use createModel function to create a model to define your store
type IState = {
  count: number;
};
const state = {
  count: 0,
};
const counter = createModel({
  state,
  reducers: {
    increment: (prevState: IState) => ({ count: prevState.count + 1 }),
    decrement: (prevState: IState, payload: number) => ({ count: prevState.count - payload }),
  },
  effects: () => ({
    async asyncDecrement(payload: number) {
      await delay(1000);
      this.decrement(payload || 1);
    },
    async anotherEffect() {
      this.asyncDecrement(2);
    },
  }),
});

const models = {
  counter,
};

// 2️⃣ Create the store
const store = createStore(models);

// 3️⃣ Consume model
const { useModel } = store;
function Counter() {
  const [{ count }, dispatchers] = useModel('counter');
  const { increment, asyncDecrement } = dispatchers;
  return (
    <div>
      <span>{count}</span>
      <button type="button" onClick={increment}>+</button>
      <button type="button" onClick={asyncDecrement}>-</button>
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
