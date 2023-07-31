import React from 'react';
import ReactDOM from 'react-dom';
import { withModel, createModel } from '@ice/store';

const delay = (time) => new Promise((resolve) => setTimeout(() => resolve(), time));

const counter = createModel({
  state: 0,
  reducers: {
    increment: (prevState) => prevState + 1,
    decrement: (prevState) => prevState - 1,
  },
  effects: () => ({
    async decrementAsync() {
      await delay(1000);
      this.decrement();
    },
  }),
});

function Counter({ model }) {
  const [count, dispatchers] = model.useValue('counter');
  const { increment, decrementAsync } = dispatchers;
  return (
    <div>
      <span>{count}</span>
      <button type="button" onClick={increment}>+</button>
      <button type="button" onClick={decrementAsync}>Async -</button>
    </div>
  );
}

const CounterWithModel = withModel(counter)(Counter);

const rootElement = document.getElementById('root');
ReactDOM.render(<CounterWithModel />, rootElement);
