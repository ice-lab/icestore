English | [简体中文](./README.zh-CN.md)

# icestore

> Lightweight React state management library based on react hooks。

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

icestore is a lightweight React state management library based on hooks. It has following core features:

* Minimal API: only 3 apis, easy to pick up in 5 minutes
* Predictable: unidirectional data flow just like Redux, only allow state mutation inside actions, make data flow easier to trace
* Optimal performance: multiple store design and only trigger rerender when state changed
* Built in async status: record loading and error status of async actions, simplify loading and error render logic in view

The data flow is as follows:   

<img src="https://user-images.githubusercontent.com/5419233/60878757-f44a6b00-a272-11e9-8afa-d47e8493e040.png" width="400" />

### Compatibility

icestore is only compatable with React 16.8.0 and later cause it's dependency of React hooks.

## Getting Started

Let's build a simple todo app from scatch using icestore which includes following steps:

* Define store config which is a plain javascript object, properties of function type correspond to action and non function type correspond to state.   

```javascript
// src/stores/todos.js
export default {
  dataSource: [],
  async refresh() {
    this.dataSource = await new Promise(resolve =>
      setTimeout(() => {
        resolve([
          {
            name: "react"
          },
          {
            name: "vue",
            done: true
          },
          {
            name: "angular"
          }
        ]);
      }, 1000)
    );  },
  add(todo) {
    this.dataSource.push(todo);
  },
  remove(index) {
    this.dataSource.splice(index, 1);
  },
  toggle(index) {
    this.dataSource[index].done = !this.dataSource[index].done;
  },
};
```
* Initialize store instance and register pre-defined store config to store instance by namespace.

```javascript
// src/stores/index.js
import todos from './todos';
import Icestore from '@ice/store';

const icestore = new Icestore();
icestore.registerStore('todos', todos);

export default icestore;
```

* In view component, import store instance, get store config (including state and actions) by using `useStore` hook, then trigger actions from `useEffect` hook or event callbacks, finally bind state to view template.

```javascript
// src/index.js
import React, { useEffect } from 'react';
import ReactDOM from 'react-dom';
import stores from './stores';

function Todo() {
  const todos = stores.useStore("todos");
  const { dataSource, refresh, add, remove, toggle } = todos;

  React.useEffect(() => {
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

  return (
    <div>
      <h2>Todos</h2>
      {!refresh.loading ? (
        dataSource.length ? (
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
          "no task"
        )
      ) : (
        "loading..."
      )}
      <div>
        <input
          onKeyDown={event => {
            if (event.keyCode === 13) {
              onAdd(event.target.value);
              event.target.value = "";
            }
          }}
          placeholder="Press Enter"
        />
      </div>
    </div>
  );
}

const rootElement = document.getElementById("root");
ReactDOM.render(<Todo />, rootElement);
```

Complete example is presented in this [sandbox](https://codesandbox.io/s/icestore-hs9fe), feel free to play with it.

## API

### registerStore

Register store config to global store instance. 

* Paramters
  - namespace {string} unique name of store
  - bindings {object} object of store config including state and actions
* Return value
  - {object} store instance

### useStores

Hooks of using multiple store.

* Paramters
  - namespaces {array} arrays of store namespace
* Return value
  - {array} array of stores' bindings

### useStore

Hooks of using single store.

* Paramters
  - namespace {string} store namespace
* Return value
  - {object} store's bindings

## Advanced use

### async status

icestore has built in async status support in async function, it enables user to access to async functions' loading and error status without defining extra state which will make code more consise and clean.

#### API

* `action.loading` - flag of whether action is executing
  - Type: {boolean}
  - Default: false
* `action.error` - flag of whether action has error after executing
  - Type: {boolean}
  - Default: false
* `action.disableLoading` - flag of whether disable action's loading effect, if set to true, views will not rerender when loading status changed
  - Type: {boolean}
  - Default: false
* `store.disableLoading` - flag of whether disable loading effect globally. Note, action's `disableLoading` flag will always takes priority when both are set
  - Type: {boolean}
  - Default: false

#### Example

```javascript
const todos = store.useStore('todos');

useEffect(() => {
  todos.refresh();
}, []);

return (
  <div>
    {todos.refresh.error ? 
      todos.refresh.loading ? (
	    <div>
	      loading.......
	    </div>
      ) : (
        <div>
	      error.......
	     </div>
      ) 
    : (
       <ul>
         {dataSource.map(({ name }) => (
           <li>{name}</li>
         ))}
       </ul>
    )}
  <Loading />
);
```
## Testing

Because all the state and action are cleanly contained in a plain object, it's easy to write test without mocking.

Example:

```javascript
describe("todos", () => {
  test("refresh data success", async () => {
    await todos.refresh();
    expect(todos.dataSource).toEqual([
      {
        name: "react"
      },
      {
        name: "vue",
        done: true
      },
      {
        name: "angular"
      }
    ]);
  });
});
```

Please refer to the `todos.spec.js` file in the above sandbox for complete reference.

## Best Practice

### Never mutate state outside actions

icestore enforce all the mutations to state can only ouccr in action methods. It will throw error when mutate state directly outside actions(eg. in view component). It will cause your mutation logic hard to trace and imposible to test if let mutation scatterd around view component other than store.

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

By design, `icestore` will trigger the rerender of all the view component subscribed to the store by `useStore` once the state of the store has changed. Which means puting more state in one store may cause more view compoenent to rerender which will affect the performance of app. So from performance aspect, it's advised to categorize your state and put them in indivisual stores. 

### Don't overuse icestore

From project management aspect, global store should only be used to store the state sharing ac ross multiple pages or state. Put local state in store will break component's self encapsulation which will affect its reusability. Take above `todo` app for example, if it exists as one page or component in the project, the state of `todo` app is prefered to store as local state in view component other than in global store.
 
## Todos

- [ ] Add debug util
- [ ] Add middleware support

## Reference

- [react-hooks-model](https://github.com/yisbug/react-hooks-model)
- [redux-react-hook](https://github.com/facebookincubator/redux-react-hook)
- [redux](https://github.com/reduxjs/redux)
- [mobx](https://github.com/mobxjs/mobx)

## Contributors

Feel free to report any questions as an [issue](https://github.com/alibaba/ice/issues/new), we'd love to have your helping hand on `ice-scripts`.

If you're interested in `icestore`, see [CONTRIBUTING.md](https://github.com/alibaba/ice/blob/master/.github/CONTRIBUTING.md) for more information to learn how to get started.

## License

[MIT](LICENSE)
