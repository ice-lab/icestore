---
id: api
title: API
---

The `createStore` is a main function exported from the library, which creates a provider and other hooks.

## createStore

`createStore(models)`

The function called to create a store.

```js
import { createStore } from '@ice/store';

const { 
  Provider,
  useModel,
  useModelActions,
  useModelActionsState,
  withModel,
  withModelActions,
  withModelActionsState,
} = createStore(models);
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

## createModel

`createStore(model)`

The function called to create a model.


```js
import { createModel } from '@ice/store';

const [
  Provider,
  useState,
  useActions,
  useActionsState,
] = createModel(model);
```

### Provider

`Provider(props: { children, initialState })`

Exposes the model to your React application, so that your components will be able to consume and interact with the model via the hooks.


```jsx
import React from 'react';
import ReactDOM from 'react-dom';
import { createStore } from '@ice/store';

const { Provider } = createModel(model);
ReactDOM.render(
  <Provider>
    <Component />
  </Provider>,
  rootEl
); 
```

#### useState

`useState(): state`

A hook granting your components access to the model state.

```jsx
const counter = {
  state: {
    value: 0,
  },
};

const [, useState] = createModel(counter);

function FunctionComponent() {
  const state = useState();

  state.value; // 0
}
```

### useActions

`useActions(): actions`

A hook granting your components access to the model actions.

```js
function FunctionComponent() {
  const actions = useActions();
  actions.add(1);
}
```

### useActionsState

`useActionsState(): { [actionName: string]: { isLoading: boolean, error: Error } } `

A hook granting your components access to the action state of the model.

```js
function FunctionComponent() {
  const actions = useActions();
  const actionsState = useActionsState();

  useEffect(() => {
    actions.fetch();
  }, []);

  actionsState.fetch.isLoading;
  actionsState.fetch.error;
}
```
