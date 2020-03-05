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
  useModelEffectsState,
  withModel,
  withModelActions,
  withModelEffectsState,
} = createStore(models);
```

### models

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

#### reducers

`reducers: { [string]: (prevState, payload) => any }`

An object of functions that change the model's state. These functions take the model's previous state and a payload, and return the model's next state. These should be pure functions relying only on the state and payload args to compute the next state. For code that relies on the "outside world" (impure functions like api calls, etc.), use effects.

```js
const counter = {
  state: 0,
  reducers: {
    add: (state, payload) => state + payload,
  }
};
```

#### effects

`effects: { [string]: (prevState, payload, actions, globalActions) => void }`

An object of functions that can handle the world outside of the model. Effects provide a simple way of handling async actions when used with async/await.

```js
const counter = {
  state: 0,
  effects: {
    async add(prevState, payload, actions) {
      // wait for data to load
      const response = await fetch('http://example.com/data');
      const data = await response.json();
      // pass the result to a local reducer
      actions.update(data);
    },
  },
  reducers: {
    update(prev, data) {
      return {...prev, ...data};
    }
  },
};
```

You can call another action by useing `actions` or `globalActions`:

```js
const user = {
  state: {
    foo: [],
  },
  effects: {
    like(prevState, payload, actions, globalActions) => {
      actions.foo(payload); // call user's actions
      globalActions.user.foo(payload); // call actions of another model
    },
  },
  reducres: {
    foo(prevState, payload) {
      return {
        ...prevState,
      };
    },
  }
};
```

### Provider

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

Set initialStates:

```jsx
import React from 'react';
import ReactDOM from 'react-dom';
import { createStore } from '@ice/store';

const models = {
  todo: {
    state: {},
  },
  user: {
    state: {},
  }
};
const { Provider } = createStore(models);

const initialStates = {
  todo: {
    title: 'Foo',
    done: true,
  },
  user: {
    name: 'Alvin',
    age: 18,
  },
};

ReactDOM.render(
  <Provider initialStates={initialStates}>
    <App />
  </Provider>,
  rootEl
); 
```

### useModel

`useModel(name: string): [ state, actions ]`

A hook granting your components access to the model instance.

```jsx
const counter = {
  state: {
    value: 0,
  },
  reducers: {
    add: (prevState, payload) => ({...prevState, value: prevState.value + payload}),
  },
};

const { useModel } = createStore({ counter });

function FunctionComponent() {
  const [ state, actions ] = useModel('counter');

  state.value; // 0

  actions.add(1); // state.value === 1
}
```

### useModelActions

`useModelActions(name: string): actions`

A hook granting your components access to the model actions.

```js
function FunctionComponent() {
  const actions = useModelActions('counter');
  actions.add(1);
}
```

### useModelEffectsState

`useModelEffectsState(name: string): { [actionName: string]: { isLoading: boolean, error: Error } } `

A hook granting your components access to the action state of the model.

```js
function FunctionComponent() {
  const actions = useModelActions('counter');
  const effectsState = useModelEffectsState('counter');

  useEffect(() => {
    actions.fetch();
  }, []);

  effectsState.fetch.isLoading;
  effectsState.fetch.error;
}
```

### withModel

`withModel(name: string, mapModelToProps?: (model: [state, actions]) => Object = (model) => ({ [name]: model }) ): (React.Component) => React.Component`

Use withModel to connect the model and class component:

```jsx
import { UseModelValue } from '@ice/store';
import todosModel from '@/models/todos';
import store from '@/store';

interface Props {
  todos: UseModelValue<typeof todosModel>; // `withModel` automatically adds the name of the model as the property
}

class TodoList extends Component<Props> {
  render() {
    const { counter } = this.props;
    const [ state, actions ] = counter;
    
    state.value; // 0

    actions.add(1);
  }
} 

export default withModel('counter')(TodoList);
```

use `mapModelToProps` to set the property:

```tsx
import { UseModelValue } from '@ice/store';
import todosModel from '@/models/todos';
import store from '@/store';

const { withModel } = store;

interface Props {
  title: string;
  customKey: UseModelValue<typeof todosModel>;
}

class TodoList extends Component<Props> {
  render() {
    const { title, customKey } = this.props;
    const [ state, actions ] = customKey;
    
    state.field; // get state
    actions.add({ /* ... */}); // run action
  }
}

export default withModel(
  'todos', 

  // mapModelToProps: (model: [state, actions]) => Object = (model) => ({ [modelName]: model }) )
  (model) => ({
    customKey: model,
  })
)(TodoList);
```

### withModelActions

`withModelActions(name: string, mapModelActionsToProps?: (actions) => Object = (actions) => ({ [name]: actions }) ): (React.Component) => React.Component`

```tsx
import { ModelActionsState, ModelActions } from '@ice/store';
import todosModel from '@/models/todos';
import store from '@/store';

const { withModelActions } = store;

interface Props {
  todosActions: ModelActions<typeof todosModel>;  // `withModelActions` automatically adds `${modelName}Actions` as the property
}

class TodoList extends Component<Props> {
  render() {
    const { todosActions } = this.props;

    todosActions.add({ /* ... */}); // run action
  }
}

export default withModelActions('todos')(TodoList);
```

You can use `mapModelActionsToProps` to set the property as the same way like `mapModelToProps`.

### withModelEffectsState

`withModelEffectsState(name: string, mapModelActionsStateToProps?: (effectsState) => Object = (effectsState) => ({ [name]: effectsState }) ): (React.Component) => React.Component`

```tsx
import { ModelActionsState, ModelActions } from '@ice/store';
import todosModel from '@/models/todos';
import store from '@/store';

const { withModelEffectsState } = store;

interface Props {
  todosActionsState: ModelActionsState<typeof todosModel>; // `todosActionsState` automatically adds `${modelName}ActionsState` as the property
}

class TodoList extends Component<Props> {
  render() {
    const { todosActionsState } = this.props;

    todosActionsState.add.isLoading; // get action state
  }
}

export default withModelEffectsState('todos')(TodoList);
```

You can use `mapModelActionsStateToProps` to set the property as the same way like `mapModelToProps`.

## createModel

`createStore(model)`

The function called to create a model.


```js
import { createModel } from '@ice/store';

const [
  Provider,
  useState,
  useActions,
  useEffectsState,
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

Set initialState:

```jsx
import React from 'react';
import ReactDOM from 'react-dom';
import { createStore } from '@ice/store';

const userModel = {
  state: {},
};
const { Provider } = createModel(userModel);
ReactDOM.render(
  <Provider initialState={{ name: 'Alvin', age: 18, }}>
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

### useEffectsState

`useEffectsState(): { [actionName: string]: { isLoading: boolean, error: Error } } `

A hook granting your components access to the action state of the model.

```js
function FunctionComponent() {
  const actions = useActions();
  const effectsState = useEffectsState();

  useEffect(() => {
    actions.fetch();
  }, []);

  effectsState.fetch.isLoading;
  effectsState.fetch.error;
}
```
