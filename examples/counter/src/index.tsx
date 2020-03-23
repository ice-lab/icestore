import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import { createStore } from '@ice/store';

const delay = (time) => new Promise((resolve) => setTimeout(() => resolve(), time));

// 1️⃣ Use a model to define your store
function useCounter() {
  const [count, setCount] = useState(0);
  const decrement = () => setCount(count - 1);
  const increment = () => setCount(count + 1);
  return {
    count,
    decrement,
    increment,
  };
}

const models = {
  counter: useCounter,
};

// 2️⃣ Create the store
const store = createStore(models);

// 3️⃣ Consume model
const { useModel, getModel } = store;
function Button() {
  function handleClick() {
    getModel('counter').increment();
  }
  console.log('Render Button.');
  return <button type="button" onClick={handleClick}>+</button>;
}
function Count() {
  console.log('Render Count.');
  const { count } = useModel('counter');
  return <span>{count}</span>;
}

// 4️⃣ Wrap your components with Provider
const { Provider } = store;
function App() {
  return (
    <Provider>
      <Count />
      <Button />
    </Provider>
  );
}

const rootElement = document.getElementById('root');
ReactDOM.render(<App />, rootElement);
