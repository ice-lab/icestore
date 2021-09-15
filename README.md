English | [简体中文](./README.zh-CN.md)

# icestore

> Simple and friendly state for React.

[![NPM version](https://img.shields.io/npm/v/@ice/store.svg?style=flat)](https://npmjs.org/package/@ice/store)
[![Package Quality](https://npm.packagequality.com/shield/@ice%2Fstore.svg)](https://packagequality.com/#?package=@ice/store)
[![build status](https://img.shields.io/travis/ice-lab/icestore.svg?style=flat-square)](https://travis-ci.org/ice-lab/icestore)
[![NPM downloads](http://img.shields.io/npm/dm/@ice/store.svg?style=flat)](https://npmjs.org/package/@ice/store)
[![Known Vulnerabilities](https://snyk.io/test/npm/@ice/store/badge.svg)](https://snyk.io/test/npm/@ice/store)
[![David deps](https://img.shields.io/david/ice-lab/icestore.svg?style=flat-square)](https://david-dm.org/ice-lab/icestore)
[![codecov](https://codecov.io/gh/ice-lab/icestore/branch/master/graph/badge.svg)](https://codecov.io/gh/ice-lab/icestore)

<table>
  <thead>
    <tr>
      <th colspan="5"><center>🕹 CodeSandbox demos 🕹</center></th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><a href="https://codesandbox.io/s/github/ice-lab/icestore/tree/master/examples/counter?module=/src/index.tsx">Counter</a></td>
      <td><a href="https://codesandbox.io/s/github/ice-lab/icestore/tree/master/examples/todos?module=/src/index.tsx">Todos</a></td>
    </tr>
  </tbody>
</table>

## Introduction

icestore is a simple and friendly state management library for React. It has the following core features:

- **Minimal & Familiar API**: No additional learning costs, easy to get started with the knowledge of Redux && React Hooks.
- **Built in Async Status**: Records loading and error status of effects, simplifying the rendering logic in the view layer.
- **Class Component Support**: Make old projects enjoying the fun of lightweight state management with friendly compatibility strategy.
- **TypeScript Support**: Provide complete type definitions to support intelliSense in VS Code.

See the [comparison table](docs/recipes.md#Comparison) for more details.

## Basic example

```jsx
import React from 'react';
import ReactDOM from 'react-dom';
import { createStore } from '@ice/store';

const delay = (time) =>
  new Promise((resolve) => setTimeout(() => resolve(), time));

// 1️⃣ Use a model to define your store
const counter = {
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
};

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

## Documents

- [API](./docs/api.md)
- [Recipes](./docs/recipes.md)
- [Upgrade Guidelines](./docs/upgrade-guidelines.md)
- [Migration](./docs/migration.md)
- [Q & A](./docs/qna.md)

## Examples

- [Counter](https://codesandbox.io/s/github/ice-lab/icestore/tree/master/examples/counter)
- [Todos](https://codesandbox.io/s/github/ice-lab/icestore/tree/master/examples/todos)
- [Class Component Support](https://codesandbox.io/s/github/ice-lab/icestore/tree/master/examples/classComponent)
- [withModel](https://codesandbox.io/s/github/ice-lab/icestore/tree/master/examples/withModel)

## Browser Compatibility

| ![Chrome](https://raw.github.com/alrra/browser-logos/master/src/chrome/chrome_48x48.png) | ![Firefox](https://raw.github.com/alrra/browser-logos/master/src/firefox/firefox_48x48.png) | ![Edge](https://raw.github.com/alrra/browser-logos/master/src/edge/edge_48x48.png) | ![IE](https://raw.github.com/alrra/browser-logos/master/src/archive/internet-explorer_9-11/internet-explorer_9-11_48x48.png) | ![Safari](https://raw.github.com/alrra/browser-logos/master/src/safari/safari_48x48.png) | ![Opera](https://raw.github.com/alrra/browser-logos/master/src/opera/opera_48x48.png) | ![UC](https://raw.github.com/alrra/browser-logos/master/src/uc/uc_48x48.png) |
| :--------------------------------------------------------------------------------------: | :-----------------------------------------------------------------------------------------: | :--------------------------------------------------------------------------------: | :--------------------------------------------------------------------------------------------------------------------------: | :--------------------------------------------------------------------------------------: | :-----------------------------------------------------------------------------------: | :--------------------------------------------------------------------------: |
|                                            ✔                                             |                                              ✔                                              |                                         ✔                                          |                                                             9+ ✔                                                             |                                            ✔                                             |                                           ✔                                           |                                      ✔                                       |

## Inspiration

icestore refines and builds upon the ideas of [rematch](https://github.com/rematch/rematch) & [constate](https://github.com/diegohaz/constate).

## Contributors

Feel free to report any questions as an [issue](https://github.com/ice-lab/icestore/issues/new), we'd love to have your helping hand on icestore.

If you're interested in icestore, see [CONTRIBUTING.md](https://github.com/alibaba/ice/blob/master/.github/CONTRIBUTING.md) for more information to learn how to get started.

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
