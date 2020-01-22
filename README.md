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

`icestore` is a lightweight React state management library based on hooks. It has the following core features:

* **Minimal & Familiar API**: No additional learning costs, easy to get started with the knowledge of React Hooks.
* **Enough & Extensible**: Cover 80% most common usage scenes and extend the remaining 20% scenes with builtin middleware mechanism.
* **Class Component Support**: Make old projects enjoying the fun of lightweight state management with friendly compatibility strategy.
* **Built in Async Status**: Records loading and error status of async actions, simplifying the rendering logic in the view layer.
* **TypeScript Support**: Provide complete type definitions to support intelliSense in VS Code.
* **Optimal Performance**: Decreases the number of view components that rerender when the state changes by creating multiple stores.

The data flow is as follows:  

<img src="https://user-images.githubusercontent.com/5419233/60878757-f44a6b00-a272-11e9-8afa-d47e8493e040.png" width="400" />

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
  const stores = icestore.registerStores({
    todos
  });

  export default stores;
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

Complete example is presented in this [CodeSandbox](https://codesandbox.io/s/icestore-ltpuo), feel free to play with it.

> icestore provides complete type definitions to support IntelliSense in VS Code. TS example is presented in this [CodeSandbox](https://codesandbox.io/s/icestore-ts-gduqw).

## API

### registerStores

Register multiple store configs to the global icestore instance.

* Parameters
  - namespace {string} unique name of the store
  - stores {object} multiple store's config object including store's state and actions
* Return value
  - {object} store manager object which including follow methods
      - useStore {function} Hook to use a single store.
          - Parameters
             - namespace {string} store namespace
             - equalityFn {function} optional, equality check between previous and current state
          - Return value
             - {object} single store instance

      - useStores {function} Hook to use multiple stores.
          - Parameters
              - namespaces {array} array of store namespaces
              - equalityFnArr {array} array of equalityFn for namespaces
          - Return value
              - {object} object of stores' instances divided by namespace
      - withStore {function} 
          - Parameters
              - namespace {string} store namespace
              - mapStoreToProps {function} optional, mapping store to props
          - Return value
              - HOC
      - withStores {function} 
          - Parameters
              - namespaces {array} array of store namespaces
              - mapStoresToProps {function} optional, mapping store to props
          - Return value
              - HOC
      - getStore {function} Get the store by namespace.
          - Parameters
              - namespace {string} store namespace
          - Return value
              - {object} store
      - getState {function} Get the latest state of individual store by namespace.
          - Parameters
              - namespace {string} store namespace
          - Return value
              - {object} the latest state of the store

### applyMiddleware

Apply middleware to all the store if the second parameter is not specified,
otherwise apply middleware the store by namespace.

* Parameters
  - middlewares {array} middleware array to be applied
  - namespace {string} store namespace
* Return value
  - void

## Advanced Use

### Store interaction

Store interaction is a common usage scene which can be implemented by calling actions from other store in a store's action.

#### Example

Suppose you have a User Store, which records the number of tasks of the user. And a Tasks Store, which records the task list of the system. Every time a user adds a task, user's task number needs to be updated.

```tsx
// src/store/user
export interface User {
  name: string;
  tasks: number;
}
export const user: User = {
  dataSource: {
    name: '',
    tasks: 0,
  },
  async refresh() {
    this.dataSource = await fetch('/user');
  },
};

// src/store/tasks
import { user }  from './user';

export interface Task {
  title: string;
  done?: boolean;
}
export const tasks = {
  dataSource: [],
  async refresh() {
    this.dataSource = await fetch('/tasks');
  },
  async add(task: Task) {
    this.dataSource = await fetch('/tasks/add', task);

    // Retrieve user information after adding tasks
    await user.refresh();
  },
};

// src/store/index
import Icestore from '@ice/store';
import { task } from './task';
import { user } from './user';

const icestore = new Icestore();
const stores = icestore.registerStores({
  task,
  user,
});

export default stores;
```

#### Pay attention to circular dependencies

Please pay attention to circular dependencies problem when actions calling each other between stores.

For example, the action A in Store A calls the action B in Store B and the action B in Store B calls the action A in Store A will results into an endless loop.

Be careful the possibility of endless loop problem will arise when methods from different stores call each other.

### Async actions' executing status

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

#### Example

```javascript
function Foo() {
  const todos = stores.useStore('todos');
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
    </div>
  );
}
```

#### Disable async state

If you do not need async state, you can disable to reduce render.

Disable async state of a single action:

```jsx
function Foo() {
  const todos = stores.useStore('todos');
  const { refresh, dataSource } = todos;
  refresh.disableLoading = true;

  useEffect(() => {
    refresh();
  }, []);

  return (
    <div>
      <ul>
        {dataSource.map(({ name }) => (
          <li>{name}</li>
        ))}
      </ul>
    </div>
  );
}
```

Disable async state of store:

```javascript
import Icestore from '@ice/store';
import todos from './store/todos';
import foo from './store/foo';

const icestore = new Icestore();

// disable all stores
icestore.applyOptions({
  disableLoading: true
});

// or disable single store
icestore.applyOptions({ disableLoading: true }, 'todos');

icestore.registerStores({
  todos,
  foo
});
```

### Class Component Support

```tsx
import React from 'react';
import ReactDOM from 'react-dom';
import Icestore from '@ice/store';
import {Store} from '@ice/store/lib/types';

// Define Store
interface TodosStore {
  dataSource: Array<{
    id: number;
    name: string;
  }>;
  refresh: () => void;
  remove: (id: number) => void;
}

const todos: TodosStore = {
  // Action && State 
};

// Register Store
const icestore = new Icestore();
const stores = icestore.registerStores({
  todos,
});

//  Declaration Props for Component
class TodoList extends Component<{store: Store<TodosStore>}> {
  onRmove = (id) => {
    const {store} = this.props;
    store.remove(id);
  }

  componentDidMount() {
    this.props.store.refresh();
  }

  render() {
    const {store} = this.props;
    return (
      <div>
        {
          store.dataSource.map(({id, name}) => {
            return (<p>
              {name}
              <button onClick={() => onRmove(id)} >Delete</button>
            </p>);
          })
        }
      </div>
    );
  }
}

// Bind Store to Component
const TodoListWithStore = stores.withStore('todos')(TodoList);
ReactDOM.render(<TodoListWithStore />, document.body);
```

### Middleware

#### Context

If you have used server side frameworks such as Express or koa, you were probably familiar with the concept of middleware already. Among these frameworks, middleware is used to insert custom code between `receiving request` and `generating response`, the functionality of middlewares include data mutation、authority check before the request was handled and add HTTP header、log printing after the request was handled.

In state management area, Redux also implements middleware mechanism, it was used to put custom code between `action dispatching` and `reaching reducer`. Its functionalities include log printing, async mechanism such as thunk, promise.

Like Redux, the purpose of `icestore` implementing middleware mechanism is to add an extensive mechanism between action was not dispatched and dispatched. The difference is that `icestore` already supports async action, so there is no need to write middleware for async support.

#### middleware API

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

##### ctx API

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

#### Registration

Due the multiple store design of `icestore`, it supports registering middlewares for indivisual store as follows:

1. Global registration: middlewares apply to all stores.

	```javascript
	import Icestore from '@ice/store';
	const icestore = new Icestore();
	icestore.applyMiddleware([a, b]);
	```
2. Registration by namespace: The ultimate middleware queue of single store will merge global middlewares with its own middlewares.

	```javascript
	icestore.applyMiddleware([a, b]); 
	icestore.applyMiddleware([c, d], 'foo'); // store foo middleware is [a, b, c, d]
	icestore.applyMiddleware([d, c], 'bar'); // store bar middleware is [a, b, d, c]
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

Of course, you can also use the second parameter of the `usestore` function, `equalityfn`, to perform equality comparison of states. Then, the component will trigger rerender only when the comparison result is not true.

### Don't overuse `icestore`

From the engineering perspective, the global store should only be used to store states that are shared across multiple pages or components.

Putting local state in the global store will break the component's encapsulation, affecting its reusability. Using the todo app as an example, if the app only has one page, the state of the todo app is preferred to be stored as a local state in the view component rather than in the global store.

## Browser Compatibility

| ![Chrome](https://raw.github.com/alrra/browser-logos/master/src/chrome/chrome_48x48.png) | ![Firefox](https://raw.github.com/alrra/browser-logos/master/src/firefox/firefox_48x48.png) | ![Edge](https://raw.github.com/alrra/browser-logos/master/src/edge/edge_48x48.png) | ![IE](https://raw.github.com/alrra/browser-logos/master/src/archive/internet-explorer_9-11/internet-explorer_9-11_48x48.png) | ![Safari](https://raw.github.com/alrra/browser-logos/master/src/safari/safari_48x48.png) | ![Opera](https://raw.github.com/alrra/browser-logos/master/src/opera/opera_48x48.png) | ![UC](https://raw.github.com/alrra/browser-logos/master/src/uc/uc_48x48.png) |
| :--------------------------------------------------------------------------------------: | :-----------------------------------------------------------------------------------------: | :--------------------------------------------------------------------------------: | :--------------------------------------------------------------------------------------------------------------------------: | :--------------------------------------------------------------------------------------: | :-----------------------------------------------------------------------------------: | :--------------------------------------------------------------------------: |
|✔ |✔|✔|9+ ✔|✔|✔|✔|

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
