English | [简体中文](./README.zh-CN.md)

# icestore

> Lightweight React state management library based on react hooks

[![NPM version](https://img.shields.io/npm/v/@ice/store.svg?style=flat)](https://npmjs.org/package/@ice/store)
[![Package Quality](https://npm.packagequality.com/shield/@ice%2Fstore.svg)](https://packagequality.com/#?package=@ice/store)
[![build status](https://img.shields.io/travis/ice-lab/icestore.svg?style=flat-square)](https://travis-ci.org/ice-lab/icestore)
[![Test coverage](https://img.shields.io/codecov/c/github/ice-lab/icestore.svg?style=flat-square)](https://codecov.io/gh/ice-lab/icestore)
[![NPM downloads](http://img.shields.io/npm/dm/@ice/store.svg?style=flat)](https://npmjs.org/package/@ice/store)
[![Known Vulnerabilities](https://snyk.io/test/npm/@ice/store/badge.svg)](https://snyk.io/test/npm/@ice/store)
[![David deps](https://img.shields.io/david/ice-lab/icestore.svg?style=flat-square)](https://david-dm.org/ice-lab/icestore)

## Installation

icestore requires React 16.8.0 or later.

```bash
npm install @ice/store --save
```

## Introduction

icestore is a lightweight React state management library based on hooks. It has the following core features:

* **Minimal & Familiar API**: No additional learning costs, easy to get started with the knowledge of React Hooks.
* **Class Component Support**: Make old projects enjoying the fun of lightweight state management with friendly compatibility strategy.
* **Built in Async Status**: Records loading and error status of async actions, simplifying the rendering logic in the view layer.
* **TypeScript Support**: Provide complete type definitions to support intelliSense in VS Code.

## Getting Started

Let's build a simple todo app from scatch using icestore which includes following steps:

* Use a model to define your store：

  ```javascript
  const todosModel = {
    state: {
      dataSource: [],
    },
    actions: {
      async fetch(prevState, actions) {
        await delay(1000);
        const dataSource = [
          { name: 'react' },
          { name: 'vue', done: true},
          { name: 'angular' },
        ];
        return {
          ...prevState,
          dataSource,
        }
      },
      add(prevState, todo) {
        return {
          ...prevState,
          dataSource: [
            ...prevState.dataSource,
            todo,
          ]
        };
      },
    },
  };

  export default {
    todos: todosModel
  };
  ```
* Create the store:

  ```javascript
  import { createStore } from '@ice/store';
  import models from './models';

  export default createStore(models);
  ```
* Wrap your application:

  ```jsx
  import React from 'react';
  import ReactDOM from 'react-dom';
  import store from './store';

  const { Provider } = store;
  ReactDOM.render(
    <Provider>
      <App />
    </Provider>,
    rootEl
  ); 
  ```
* Consume Model:

  ```jsx
  import React, { useEffect } from 'react';
  import store from './store';
  
  const { useModel } = store;
  function Todos() {
    const [ state, actions ] = useModel('todos');
    const { dataSource } = state;
    const { fetch, add } = actions;

    useEffect(() => {
      fetch();
    }, []);

    function handleAdd(name) {
      add({ name });
    }

    return (
      <div>
        <ul>
          {dataSource.map(({ name, done }, index) => (
            <li key={index}>
              <label>
                <input
                  type="checkbox"
                  checked={done}
                  onClick={() => onCheck(index)}
                />
                {done ? <s>{name}</s> : <span>{name}</span>}
              </label>
              <button onClick={() => onRemove(index)}>-</button>
            </li>
          ))}
        </ul>
        <div>
          <input
            onKeyDown={event => {
              if (event.keyCode === 13) {
                handleAdd(event.target.value);
                event.target.value = '';
              }
            }}
            placeholder="Press Enter"
          />
        </div>
      </div>
    );
  }
  ```

## Browser Compatibility

| ![Chrome](https://raw.github.com/alrra/browser-logos/master/src/chrome/chrome_48x48.png) | ![Firefox](https://raw.github.com/alrra/browser-logos/master/src/firefox/firefox_48x48.png) | ![Edge](https://raw.github.com/alrra/browser-logos/master/src/edge/edge_48x48.png) | ![IE](https://raw.github.com/alrra/browser-logos/master/src/archive/internet-explorer_9-11/internet-explorer_9-11_48x48.png) | ![Safari](https://raw.github.com/alrra/browser-logos/master/src/safari/safari_48x48.png) | ![Opera](https://raw.github.com/alrra/browser-logos/master/src/opera/opera_48x48.png) | ![UC](https://raw.github.com/alrra/browser-logos/master/src/uc/uc_48x48.png) |
| :--------------------------------------------------------------------------------------: | :-----------------------------------------------------------------------------------------: | :--------------------------------------------------------------------------------: | :--------------------------------------------------------------------------------------------------------------------------: | :--------------------------------------------------------------------------------------: | :-----------------------------------------------------------------------------------: | :--------------------------------------------------------------------------: |
|✔ |✔|✔|9+ ✔|✔|✔|✔|

## Inspiration

icestore refines and builds upon the ideas of [constate](https://github.com/diegohaz/constate) & [rematch](https://github.com/rematch/rematch).

## Contributors

Feel free to report any questions as an [issue](https://github.com/alibaba/ice/issues/new), we'd love to have your helping hand on icestore.

If you're interested in icestore, see [CONTRIBUTING.md](https://github.com/alibaba/ice/blob/master/.github/CONTRIBUTING.md) for more information to learn how to get started.

## License

[MIT](LICENSE)
