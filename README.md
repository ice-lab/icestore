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

### Step 1 - Use a model to define your store：

```javascript
export const todos = {
  state: {
    dataSource: [],
  },
  actions: {
    async fetch(prevState) {
      await delay(1000);
      const dataSource = [
        { name: 'react' },
        { name: 'vue', done: true},
        { name: 'angular' },
      ];
      return {
        ...prevState,
        dataSource,
      };
    },
    add(prevState, todo) {
      return {
        ...prevState,
        dataSource: [
          ...prevState.dataSource,
          todo,
        ],
      };
    },
  },
};
```

### Step 2 - Create the store

```javascript
import { createStore } from '@ice/store';
import * as models from './models';

export default createStore(models);
```

### Step 3 - Wrap your application

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

### Step 4 - Consume model

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

  function onAdd(event, name) {
    if (event.keyCode === 13) {
      add({ name: event.target.value });
      event.target.value = '';
    }
  }

  return (
    <div>
      <ul>
        {dataSource.map(({ name, done }, index) => (
          <li key={index}>
            {done ? <s>{name}</s> : <span>{name}</span>}
          </li>
        ))}
      </ul>
      <input
        onKeyDown={onAdd}
        placeholder="Press Enter"
      />
    </div>
  );
}
```

## API

**createStore**

`createStore(models)`

The function called to create a store.

```js
import { createStore } from '@ice/store';

const store = createStore(models);
const { Provider, useModel, withModel } = store;
```

### Parameters

**models**

```js
import { createStore } from '@ice/store'

const counterModel = {
  state: {
    value: 0,
  },
};

const models = {
  counter: counterModel,
};

createStore(models);
```

#### state

`state: any`: Required

The initial state of the model.

```js
const model = {
  state: { loading: false },
};
```

#### actions

`actions: { [string]: (prevState, payload, actions, globalActions) => any }`

An object of functions that change the model's state. These functions take the model's previous state and a payload, and return the model's next state. 

```js
const counter = {
  state: 0,
  actions: {
    add: (prevState, payload) => prevState + payload,
  },
};
```

Actions provide a simple way of handling async actions when used with async/await:

```js
const counter = {
  actions: {
    async addAsync(prevState, payload) => {
      await delay(1000);
      return prevState + payload;
    },
  },
};
```

You can call another action by useing `actions` or `globalActions`:

```js
const user = {
  state: {
    foo: [],
  },
  actions: {
    like(prevState, payload, actions, globalActions) => {
      actions.foo(payload); // call user's actions
      globalActions.user.foo(payload); // call actions of another model
      
      // do something...

      return {
        ...prevState,
      };
    },
    foo(prevState, id) {
      // do something...

      return {
        ...prevState,
      };
    },
  },
};
```

### Return

#### Provider

`Provider(props: { children, initialStates })`

Exposes the store to your React application, so that your components will be able to consume and interact with the store via the hooks.

```jsx
import React from 'react';
import ReactDOM from 'react-dom';
import { createStore } from '@ice/store';

const { Provider } = createStore(models);
ReactDOM.render(
  <Provider>
    <App />
  </Provider>,
  rootEl
); 
```

#### useModel

`useModel(name: string): [ state, actions ]`

A hook granting your components access to the model instance.

```jsx
const counter = {
  state: {
    value: 0,
  },
  actions: {
    add: (prevState, payload) => ({...prevState, value: prevState.value + payload}),
  },
};

const { userModel } = createStore({ counter });

function FunctionComponent() {
  const [ state, actions ] = userModel('name');

  state.value; // 0

  actions.add(1); // state.value === 1
}
```

#### useModelActions

`useModelActions(name: string): actions`

A hook granting your components access to the model actions.

```js
function FunctionComponent() {
  const actions = useModelActions('name');
  actions.add(1);
}
```

#### useModelActionsState

`useModelActionsState(name: string): { [actionName: string]: { isLoading: boolean, error: Error } } `

A hook granting your components access to the action state of the model.

```js
function FunctionComponent() {
  const actions = useModelActions('name');
  const actionsState = useModelActionsState('name');

  useEffect(() => {
    actions.fetch();
  }, []);

  actionsState.fetch.isLoading;
  actionsState.fetch.error;
}
```

#### withModel

`withModel(name: string, mapModelToProps?: (model: [state, actions]) => Object = (model) => ({ [name]: model }) ): (React.Component) => React.Component`

Use withModel to connect the model and class component:

```jsx
class TodoList extends Component {
  render() {
    const { counter } = this.props;
    const [ state, actions ] = counter;
    
    state.value; // 0

    actions.add(1);
  }
} 

export default withModel('counter')(TodoList);
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
