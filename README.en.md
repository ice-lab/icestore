English | [简体中文](./README.md)

# icestore

> Simple and friendly state for React.

[![NPM version](https://img.shields.io/npm/v/@ice/store.svg?style=flat)](https://npmjs.org/package/@ice/store)
[![build status](https://github.com/ice-lab/icestore/actions/workflows/ci.yml/badge.svg)](https://github.com/ice-lab/icestore/actions/workflows/ci.yml)
[![NPM downloads](http://img.shields.io/npm/dm/@ice/store.svg?style=flat)](https://npmjs.org/package/@ice/store)
[![codecov](https://codecov.io/gh/ice-lab/icestore/branch/master/graph/badge.svg)](https://codecov.io/gh/ice-lab/icestore)

## Versions

| Version | Branch | Docs |
| --- | --- | --- |
| V2  | master     |  [Docs](https://github.com/ice-lab/icestore#文档)
| V1  | stable/1.x |  [Docs](https://github.com/ice-lab/icestore/tree/stable/1.x#documents)

## Introduction

icestore is a simple and friendly state management library for React. It has the following core features:

- **Minimal & Familiar API**: No additional learning costs, easy to get started with the knowledge of Redux && React Hooks.
- **Built in Async Status**: Records loading and error status of effects, simplifying the rendering logic in the view layer.
- **Class Component Support**: Make old projects enjoying the fun of lightweight state management with friendly compatibility strategy.
- **TypeScript Support**: Provide complete type definitions to support intelliSense in VS Code.

See the [comparison table](docs/recipes.md#能力对比表) for more details.

## Documents

- [API](./docs/api.md)
- [Recipes](./docs/recipes.md)
- [Upgrade from V1](./docs/upgrade-guidelines.md)
- [Q & A](./docs/qna.md)

## Examples

- [Counter](https://codesandbox.io/s/github/ice-lab/icestore/tree/master/examples/counter)
- [Todos](https://codesandbox.io/s/github/ice-lab/icestore/tree/master/examples/todos)
- [Class Component Support](https://codesandbox.io/s/github/ice-lab/icestore/tree/master/examples/classComponent)
- [withModel](https://codesandbox.io/s/github/ice-lab/icestore/tree/master/examples/withModel)

## Basic example

```jsx
import React from 'react';
import ReactDOM from 'react-dom';
import { createStore, createModel } from '@ice/store';

const delay = (time) =>
  new Promise((resolve) => setTimeout(() => resolve(), time));

// 1️⃣ Use a model to define your store
const counter = createModel({
  state: 0,
  reducers: {
    increment: (prevState) => prevState + 1,
    decrement: (prevState) => prevState - 1,
  },
  effects: () => ({
    async asyncDecrement() {
      await delay(1000);
      this.decrement();
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
  const [count, dispatchers] = useModel('counter');
  const { increment, asyncDecrement } = dispatchers;
  return (
    <div>
      <span>{count}</span>
      <button type="button" onClick={increment}>
        +
      </button>
      <button type="button" onClick={asyncDecrement}>
        -
      </button>
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
```

## Installation

icestore requires React 16.8.0 or later.

```bash
npm install @ice/store --save
```

## Inspiration

icestore refines and builds upon the ideas of [rematch](https://github.com/rematch/rematch) & [constate](https://github.com/diegohaz/constate).

## Contributors

Feel free to report any questions as an [issue](https://github.com/ice-lab/icestore/issues/new), we'd love to have your helping hand on icestore.

Develop:

```bash
$ cd icestore/
$ npm install
$ npm run test
$ npm run watch

$ cd examples/counter
$ npm install
$ npm link ../../                    # link icestore
$ npm link ../../node_modules/react  # link react
$ npm start
```

## License

[MIT](LICENSE)