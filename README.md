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

```bash
npm install @ice/store --save
```

## Introduction

`icestore` is a lightweight React state management library based on hooks. It has the following core features:

* Minimal API: Contains 5 APIs, which is easily learnable in 5 minutes.
* Predictable: Uses unidirectional data flow (similar to Redux) and allows state mutation only inside actions, allowing data flow to be traced easily.
* Optimal performance: Decreases the number of view components that rerender when the state changes by creating multiple stores.
* Built in async status: Records loading and error status of async actions, simplifying the rendering logic in the view layer.

The data flow is as follows:  

<img src="https://user-images.githubusercontent.com/5419233/60878757-f44a6b00-a272-11e9-8afa-d47e8493e040.png" width="400" />

### Compatibility

`icestore` is only compatable with React 16.8.0 and later because of its dependency on React hooks.

## Getting Started

Let's build a simple todo app from scatch using `icestore` which includes following steps:

* Define a store config (a plain JavaScript object) which consists of function properties (correspond to the action) and other properties (correspond to state).

```javascript
// src/stores/todos.js
export default {
  dataSource: [],
  async refresh() {
    this.dataSource = await new Promise(resolve =>
      setTimeout(() => {
        resolve([
          { name: 'react' },
          { name: 'vue', done: true },
          { name: 'angular' }
        ]);
      }, 1000)
    );  },
  add(todo) {
    this.dataSource.push(todo);
  },
};
```
* Initialize the store instance and register the pre-defined store config using the namespace.

```javascript
// src/stores/index.js
import todos from './todos';
import Icestore from '@ice/store';

const icestore = new Icestore();
icestore.registerStore('todos', todos);

export default icestore;
```

* In the view component, you can get the store config (including state and actions) by using the useStore hook after importing the store instance. After that, you can trigger actions through event callbacks or by using the useEffect hook, which binds the state to the view template.

```javascript
// src/index.js
import React, { useEffect } from 'react';
import ReactDOM from 'react-dom';
import stores from './stores';

function Todo() {
  const todos = stores.useStore('todos');
  const { dataSource, refresh, add, remove, toggle } = todos;

  useEffect(() => {
    refresh();
  }, []);

  function onAdd(name) {
    add({ name });
  }

  function onRemove(index) {
    remove(index);
  }

  function onCheck(index) {
    toggle(index);
  }

  const noTaskView = <span>no task</span>;
  const loadingView = <span>loading...</span>;
  const taskView = dataSource.length ? (
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
  ) : (
    noTaskView
  );

  return (
    <div>
      <h2>Todos</h2>
      {!refresh.loading ? taskView : loadingView}
      <div>
        <input
          onKeyDown={event => {
            if (event.keyCode === 13) {
              onAdd(event.target.value);
              event.target.value = '';
            }
          }}
          placeholder="Press Enter"
        />
      </div>
    </div>
  );
}

const rootElement = document.getElementById('root');
ReactDOM.render(<Todo />, rootElement);
```

Complete example is presented in this [sandbox](https://codesandbox.io/s/icestore-hs9fe), feel free to play with it.

## Best Practices

### Never mutate state outside actions

`icestore` enforces all the mutations to the state to occur only in action methods. Mutation occurred outside actions will not take effect (e.g. in the view component).

The reason is that the mutation logic would be hard to trace and impossible to test as there might be unpredictable changes made to the view components as a result of mutations outside actions.

```javascript
  // store.js
  export default {
    inited: false,
    setInited() {
      this.inited = true;
    }
  }
  
  // view.js
  const todos = useStore('todos');
  
  useEffect(() => {
    // bad
    todos.inited = true;
    
    // good
    todos.setInited();
  });
```

### Divide store as small as possible

By design, `icestore` will trigger the rerender of all the view components subscribed to the store (by using useStore) once the state of the store has changed.

This means that putting more state in one store may cause more view components to rerender, affecting the overall performance of the application. As such, it is advised to categorize your state and put them in individual stores to improve performance.

### Don't overuse `icestore`

From the engineering perspective, the global store should only be used to store states that are shared across multiple pages or components.

Putting local state in the global store will break the component's encapsulation, affecting its reusability. Using the todo app as an example, if the app only has one page, the state of the todo app is preferred to be stored as a local state in the view component rather than in the global store.

## API

### registerStore

Register store config to the global store instance.

* Parameters
  - namespace {string} unique name of the store
  - bindings {object} object of store config including state and actions
* Return value
  - {object} store instance

### applyMiddleware

Apply middleware to all the store if the second parameter is not specified,
otherwise apply middleware the store by namespace.

* Parameters
  - middlewares {array} middleware array to be applied
  - namespace {string} store namespace
* Return value
  - void

### useStores

Hook to use multiple stores.

* Parameters
  - namespaces {array} array of store namespaces
* Return value
  - {array} array of stores' instances

### useStore

Hook to use a single store.

* Parameters
  - namespace {string} store namespace
* Return value
  - {object} single store instance

### getState

Get the latest state of individual store by namespace.

* Parameters
  - namespace {string} store namespace
* Return value
  - {object} the latest state of the store

## Advanced use

### async actions' executing status

`icestore` has built-in support to access the executing status of async actions. This enables users to have access to the loading and error executing status of async actions without defining extra state, making the code more consise and clean.

#### API

* `action.loading` - flag checking if the action is executing
  - Type: {boolean}
  - Default: false
* `action.error` - error object if error was throw after action executed
  - Type: {object}
  - Default: null
* `action.disableLoading` - flag to disable the loading effect of the action. If this is set to true, relevant view components would not rerender when their loading status changes
  - Type: {boolean}
  - Default: false
* `store.disableLoading` - flag to disable the loading effect at global level. An action's disableLoading flag will always take priority when both values are set.
  - Type: {boolean}
  - Default: false

#### Example

```javascript
const todos = store.useStore('todos');
const { refresh, dataSource } = todos;

useEffect(() => {
  refresh();
}, []);

const loadingView = (
  <div>
    loading.......
  </div>
);

const taskView = !refresh.error ? (
  <ul>
   {dataSource.map(({ name }) => (
     <li>{name}</li>
   ))}
  </ul>
) : (
  <div>
    {refresh.error.message}
  </div>
);


return (
  <div>
    {!refresh.loading ? taskView : loadingView}
  <Loading />
);
```

### Middleware

#### Context

If you have used server side frameworks such as Express or koa, you were probably familiar with the concept of middleware already. Among these frameworks, middleware is used to insert custom code between `receiving request` and `generating response`, the functionality of middlewares include data mutation、authority check before the request was handled and add HTTP header、log printing after the request was handled.

In state management area, Redux also implements middleware mechanism, it was used to put custom code between `action dispatching` and `reaching reducer`. Its functionalities include log printing, async mechanism such as thunk, promise.

Like Redux, the purpose of `icestore` implementing middleware mechanism is to add an extensive mechanism between action was not dispatched and dispatched. The difference is that `icestore` already supports async action, so there is no need to write middleware for async support.

### middleware API

`icestore` takes insiprations from koa for its middleware API design as follows:

```javascript
async (ctx, next) =>  {
  // logic before action was dispatched

  const result = await next();

  // logic after action was dispatched

  return result;
}
```
Note: If there is return value in action, all the middlewares in the chain must return the executing result of the next middleware to ensure the action's return value is correctly return from middleware chain.

#### ctx API

* ctx.action - the object of the action dispatched
  * Type：{object}
  * Return Value：void
* ctx.action.name - the name of action dispatched
  * Type：{string}
  * Return Value：void
* ctx.action.arguments - the arguments of current action function
  * Type：{array}
  * Return Value：void
* ctx.store - the store object
  * Type：{object}
  * Return Value：void
* ctx.store.namespace - the store namespace
  * Type：{string}
  * Return Value：void
* ctx.store.getState - the method to get the latest state value of current store
  * Type：{function}
  * Return Value：void

The example is as follows:

```javascript
const {
  action, // the object of the action dispatched
  store, // the store object
} = ctx;

const {
  name, // the name of action dispatched
  arguments, // the arguments of current action function
} = action;

const { 
  namespace,  // the store namespace
  getState, // the method to get the latest state value of current store
} = store;
```

### Registration

Due the multiple store design of `icestore`, it supports registering middlewares for indivisual store as follows:

1. Global registration 
  *  Global registration middlewares apply to all stores.

	```javascript
	import Icestore from '@ice/store';
	const stores = new Icestore();
	stores.applyMiddleware([a, b]);
	```

2. Registration by namespace  
  * The ultimate middleware queue of single store will merge global middlewares with its own middlewares.

	```javascript
	stores.applyMiddleware([a, b]); 
	stores.applyMiddleware([c, d], 'foo'); // store foo middleware is [a, b, c, d]
	stores.applyMiddleware([d, c], 'bar'); // store bar middleware is [a, b, d, c]
	```

## Debug

`icestore` provide an official logger middleware to facilitate user traceing state changes and improve debug productivity.

### Installation

```bash
npm install @ice/store-logger --save
```

### Guide

Use `applyMiddleware` API to push logger middleware into middleware queue.

```javascript
import todos from './todos';
import Icestore from '@ice/store';
import logger from '@ice/store-logger';

const icestore = new Icestore();

const middlewares = [];

// Turn off logger middleware in production enviroment
if (process.env.NODE_ENV !== 'production') {
  middlewares.push(logger);
}

icestore.applyMiddleware(middlewares);
icestore.registerStore('todos', todos);
```

When action was dispatched, the log will be printed into browser's DevTools by realtime:

<img src="https://user-images.githubusercontent.com/5419233/63344463-13184300-c383-11e9-96da-2de3b41f6e9b.png"  width="250" />

The logger includes the following infos:

* Store Name: namespace of current store
* Action Name: action being dispatched
* Added / Deleted / Updated: type of state changes
* Old state: state before change
* New state: state after change


## Testing

Because all the states and actions are contained in a plain JavaScript object, it is easy to write tests without using mock objects.

Example:

```javascript
describe('todos', () => {
  test('refresh data success', async () => {
    await todos.refresh();
    expect(todos.dataSource).toEqual([
      {
        name: 'react'
      },
      {
        name: 'vue',
        done: true
      },
      {
        name: 'angular'
      }
    ]);
  });
});
```

Please refer to the `todos.spec.js` file in the sandbox above for complete reference.

## Reference

- [react-hooks-model](https://github.com/yisbug/react-hooks-model)
- [redux-react-hook](https://github.com/facebookincubator/redux-react-hook)
- [redux](https://github.com/reduxjs/redux)
- [mobx](https://github.com/mobxjs/mobx)

## Contributors

Feel free to report any questions as an [issue](https://github.com/alibaba/ice/issues/new), we'd love to have your helping hand on `icestore`.

If you're interested in `icestore`, see [CONTRIBUTING.md](https://github.com/alibaba/ice/blob/master/.github/CONTRIBUTING.md) for more information to learn how to get started.

## License

[MIT](LICENSE)
