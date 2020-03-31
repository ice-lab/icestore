---
id: api
title: API
---

The `createStore` is a main function exported from the library, which creates a provider and other hooks.

## createStore

`createStore(models, options)`

The function called to create a store.

```js
import { createStore } from '@ice/store';

const { 
  // major apis
  Provider,
  useModel,
  getModel,
  withModel,

  // auxiliary apis
  useModelDispatchers,
  useModelEffectsState,
  withModelDispatchers,
  withModelEffectsState,
  getModelState,
  getModelDispatchers,
} = createStore(models);
```

### Arguments

#### models

##### state

`state: any`: Required

The initial state of the model.

```js
const model = {
  state: { loading: false },
};
```

##### reducers

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

Reducer could be use mutable method to achieve immutable state. Like the example:

```js
const todo = {
  state: [
    {
      todo: 'Learn typescript',
      done: true,
    },
    {
      todo: 'Try immer',
      done: false,
    },
  ],
  reducers: {
    done(state) {
      state.push({ todo: 'Tweet about it' });
      state[1].done = true;
    },
  },
}
```

In Immer, reducers perform mutations to achieve the next immutable state. Keep in mind, Immer only supports change detection on plain objects and arrays, so primitive values like strings or numbers will always return a change. Like the example:

```js
const count = {
  state: 0,
  reducers: {
    add(state) {
      state += 1;
      return state;
    },
  },
}
```

See [docs/recipes](./recipes.md#immutable-description) for more details.

##### effects

`effects: (dispatch) => ({ [string]: (payload, rootState, meta) => void })`

An object of functions that can handle the world outside of the model. Effects provide a simple way of handling async actions when used with async/await.

```js
const counter = {
  state: 0,
  effects: (dispatch) => ({
    async add(payload, rootState, meta) {
      // wait for data to load
      const response = await fetch('http://example.com/data');
      const data = await response.json();
      // pass the result to a local reducer
      this.update(data);
    },
  }),
};
```

You can call another action by useing `dispatch`:

```js
const user = {
  state: {
    foo: [],
  },
  effects: (dispatch) => ({
    like(payload, rootState) => {
      this.foo(payload); // call user's actions
      dispatch.todos.foo(payload); // call actions of another model
    },
  }),
  reducres: {
    foo(prevState, payload) {
      return {
        ...prevState,
      };
    },
  }
};
```

#### options

- `initialState` (Object, optional, default=undefined)

  Allows you to hydrate your store with initial state (for example state received from your server in a server rendering context).

  ```jsx
  import { createStore } from '@ice/store';

  const models = {
    todo: { state: {}, },
    user: { state: {}, },
  };

  const initialState = {
    todo: {
      title: 'Foo',
      done: true,
    },
    user: {
      name: 'Alvin',
      age: 18,
    },
  };
  createStore(models, { initialState });
  ```
- `disableImmer` (boolean, optional, default=false)

  If you set this to true, then [immer](https://github.com/immerjs/immer) will be disabled, meaning you can no longer mutate state directly within actions and will instead have to return immutable state as in a standard reducer.
- `disableError` (boolean, optional, default=false)

  If you set this to true, then `useModelEffectsError` and `withModelEffectsError` will not be available. Turn it on only if you are very focused on performance or intentionally throw errors.

  > We will set this option to on in future releases to reduce it by default.
- `disableLoading` (boolean, optional, default=false)

  If you set this to true, then `useModelEffectsLoading` and `withModelEffectsLoading` will not be available.

  > We will set this option to on in future releases to reduce it by default.

### Returns

#### Provider

`Provider(props: { children })`

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

`useModel(name: string): [ state, dispatchers ]`

A hook granting your components access to the model instance.

```jsx
const counter = {
  state: {
    value: 0,
  },
  reducers: {
    add: (state, payload) => {
      state.value = state.value + payload;
    },
  },
};

const { useModel } = createStore({ counter });

function FunctionComponent() {
  const [ state, dispatchers ] = useModel('counter');

  state.value; // 0

  dispatchers.add(1); // state.value === 1
}
```

#### getModel

`getModel(name: string): [ state, dispatchers ]`

A API granting you access to the model instance.

```js
import { useCallback } from 'react';
import store from '@/store';

function FunctionComponent() {
  const memoizedCallback = useCallback(
    () => {
      const [state] = store.getModel('foo');
      doSomething(a, b, state);
    },
    [a, b],
  );
}
```

#### withModel

`withModel(name: string, mapModelToProps?: (model: [state, dispatchers]) => Object = (model) => ({ [name]: model }) ): (React.Component) => React.Component`

Use withModel to connect the model and Class Component:

```jsx
import { ExtractIModelFromModelConfig } from '@ice/store';
import todosModel from '@/models/todos';
import store from '@/store';

interface Props {
  todos: ExtractIModelFromModelConfig<typeof todosModel>; // `withModel` automatically adds the name of the model as the property
}

class TodoList extends Component<Props> {
  render() {
    const { counter } = this.props;
    const [ state, dispatchers ] = counter;
    
    state.value; // 0

    dispatchers.add(1);
  }
} 

export default withModel('counter')(TodoList);
```

use `mapModelToProps` to set the property:

```tsx
import { ExtractIModelFromModelConfig } from '@ice/store';
import todosModel from '@/models/todos';
import store from '@/store';

const { withModel } = store;

interface Props {
  title: string;
  customKey: ExtractIModelFromModelConfig<typeof todosModel>;
}

class TodoList extends Component<Props> {
  render() {
    const { title, customKey } = this.props;
    const [ state, dispatchers ] = customKey;
    
    state.field; // get state
    dispatchers.add({ /* ... */}); // run action
  }
}

export default withModel(
  'todos', 

  // mapModelToProps: (model: [state, dispatchers]) => Object = (model) => ({ [modelName]: model }) )
  (model) => ({
    customKey: model,
  })
)(TodoList);
```

#### useModelDispatchers

`useModelDispatchers(name: string): dispatchers`

A hook granting your components access to the model dispatchers.

```js
function FunctionComponent() {
  const dispatchers = useModelDispatchers('counter');
  dispatchers.add(1);
}
```

#### useModelEffectsLoading

`useModelEffectsLoading(name: string): { [actionName: string]: boolean } `

A hook granting your components access to the action loading state of the model.

```js
function FunctionComponent() {
  const dispatchers = useModelDispatchers('counter');
  const effectsLoading = useModelEffectsLoading('counter');

  useEffect(() => {
    dispatchers.fetch();
  }, []);

  effectsLoading.fetch; // boolean
}
```

#### useModelEffectsError

`useModelEffectsError(name: string): { [actionName: string]: { error: Error; value: boolean;}} `

A hook granting your components access to the action error state of the model.

```js
function FunctionComponent() {
  const dispatchers = useModelDispatchers('counter');
  const effectsError = useModelEffectsError('counter');

  useEffect(() => {
    dispatchers.fetch();
  }, []);

  effectsError.fetch.error; // Error
}
```

#### withModelDispatchers

`withModelDispatchers(name: string, mapModelDispatchersToProps?: (dispatchers) => Object = (dispatchers) => ({ [name]: dispatchers }) ): (React.Component) => React.Component`

```tsx
import { ExtractIModelDispatchersFromModelConfig } from '@ice/store';
import todosModel from '@/models/todos';
import store from '@/store';

const { withModelDispatchers } = store;

interface Props {
  todosDispatchers: ExtractIModelDispatchersFromModelConfig<typeof todosModel>;  // `withModelDispatchers` automatically adds `${modelName}Dispatchers` as the property
}

class TodoList extends Component<Props> {
  render() {
    const { todosDispatchers } = this.props;

    todosDispatchers.add({ /* ... */}); // run action
  }
}

export default withModelDispatchers('todos')(TodoList);
```

You can use `mapModelDispatchersToProps` to set the property as the same way like `mapModelToProps`.

#### withModelEffectsLoading

`withModelEffectsLoading(name: string, mapModelEffectsLoadingToProps?: (effectsLoading) => Object = (effectsLoading) => ({ [name]: effectsLoading }) ): (React.Component) => React.Component`

```tsx
import { ExtractIModelEffectsLoadingFromModelConfig } from '@ice/store';
import todosModel from '@/models/todos';
import store from '@/store';

const { withModelEffectsLoading } = store;

interface Props {
  todosEffectsLoading: ExtractIModelEffectsLoadingFromModelConfig<typeof todosModel>; // `todosEffectsLoading` automatically adds `${modelName}EffectsLoading` as the property
}

class TodoList extends Component<Props> {
  render() {
    const { todosEffectsLoading } = this.props;

    todosEffectsLoading.add;
  }
}

export default withModelEffectsLoading('todos')(TodoList);
```

You can use `mapModelEffectsLoadingToProps` to set the property as the same way like `mapModelToProps`.

#### withModelEffectsError

`withModelEffectsError(name: string, mapModelEffectsErrorToProps?: (effectsError) => Object = (effectsError) => ({ [name]: effectsError }) ): (React.Component) => React.Component`

```tsx
import { ExtractIModelEffectsErrorFromModelConfig } from '@ice/store';
import todosModel from '@/models/todos';
import store from '@/store';

const { withModelEffectsError } = store;

interface Props {
  todosEffectsError: ExtractIModelEffectsErrorFromModelConfig<typeof todosModel>; // `todosEffectsError` automatically adds `${modelName}EffectsError` as the property
}

class TodoList extends Component<Props> {
  render() {
    const { todosEffectsError } = this.props;

    todosEffectsError.add;
  }
}

export default withModelEffectsError('todos')(TodoList);
```

You can use `mapModelEffectsErrorToProps` to set the property as the same way like `mapModelToProps`.

#### getModelState

`getModelState(name: string): state`

A API granting you access to the model state.

```js
import { useCallback } from 'react';
import store from '@/store';

function FunctionComponent() {
  const memoizedCallback = useCallback(
    () => {
      const state = store.getModelState('foo');
      something(a, state);
    },
    [a, b],
  );
}
```

#### getModelDispatchers

`getModelDispatchers(name: string): dispatchers`

A API granting you access to the model dispatchers.

```js
import { useCallback } from 'react';
import store from '@/store';

function FunctionComponent() {
  const memoizedCallback = useCallback(
    () => {
      const dispatchers = store.getModelDispatchers('foo');
      dispatchers.foo(a, b);
    },
    [a, b],
  );
}
```
