import React from 'react';
import ReactDOM from 'react-dom';
import { createStore, createModel } from '@ice/store';
import 'react-app-polyfill/ie11';
import 'react-app-polyfill/stable';

const delay = (time: number) => new Promise<void>((resolve) => setTimeout(() => resolve(), time));

// 1️⃣ Use createModel function to create a model to define your store
const counter = createModel({
  state: {
    count: 0,
  },
  reducers: {
    increment: (prevState) => {
      prevState.count++;
    },
    decrement: (prevState, payload: number) => ({ count: prevState.count - payload }),
  },
  effects: (dispatch) => ({
    async asyncDecrement(payload: number) {
      await delay(1000);
      this.decrement(payload || 1);
      dispatch.counter.decrement(1);
    },
    async anotherEffect() {
      this.asyncDecrement(2);
    },
  }),
});

const models = {
  counter,
};

declare module '@ice/store'{
  interface IcestoreModels {
    counter: typeof counter;
  }
}

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
      <button type="button" onClick={() => asyncDecrement(1)}>-</button>
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