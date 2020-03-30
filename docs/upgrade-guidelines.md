---
id: upgrade-guidelines
title: Upgrade Guidelines
---

## 1.2 to 1.3

From 1.2 to 1.3 is fully compatible, but we recommend that you use the new API in incremental code.
We will remove the deprecated API in future versions.

### initialState

1.2:

```jsx
import store from './store';
const { Provider } = store;

const initialStates = {
  foo: {
  },
};
function App() {
  return (
    <Provider initialStates={initialStates}>
      <Todos />
    </Provider>
  );
}
```

1.3

```js
import { createStore } from '@ice/store';
import * as models from './models';

const initialState = {
  foo: {
  },
};

export default createStore(models, { initialState });
```

### Define Model Effects

1.2:

```js
const todos = {
  state: [ { title: 'Testing' } ],
  reducers: {
    foo(prevState, payload) {
    }
  },
  effects: {
    async refresh(state, payload, actions, globalActions) {
      console.log(state); // [ { title: 'Testing' } ]
      actions.foo(); // call self actions
      globalActions.user.foo(); // call another model's action
    }
  },
};
```

1.3:

```js
const todos = {
  state: [ { title: 'Testing' } ],
  reducers: {
    foo(prevState, payload) {
    }
  },
  effects: (dispatch) => ({
    async refresh(payload, rootState) {
      console.log(rootState.todos); // [ { title: 'Testing' } ]
      this.foo(); // call self actions
      dispatch.user.foo(); // call another model's action
    }
  }),
};
```

### Use Model Actions

#### useModelActions

1.2:

```jsx
import store from '@/store';

function Foo() {
  const actions = store.useModelActions('foo');
  return null;
}
```

1.3:

```jsx
import store from '@/store';

function Foo() {
  const dispatchers = store.useModelDispatchers('foo');
  return null;
}
```

#### withModelActions

1.2:

```jsx
import store from '@/store';
const { withModelActions } = store;

class TodoList extends Component {
  onRemove = (index) => {
    const actions = this.props.todosActions;
    actions.remove(index);
  }
}

export default withModelActions('todos')(TodoList);
```

1.3:

```jsx

import store from '@/store';
const { withModelDispatchers } = store;

class TodoList extends Component {
  onRemove = (index) => {
    const dispatchers = this.props.todosDispatchers;
    dispatchers.remove(index);
  }
}

export default withModelDispatchers('todos')(TodoList);
```

### Use Model Effects State

#### useModelEffectsState

1.2:

```jsx
import store from '@/store';

function Foo() {
  const effectsState = store.useModelEffectsState('foo');

  effectsState.foo.isLoading; // boolean
  effectsState.foo.error; // Error
  return null;
}
```

1.3:

```jsx
import store from '@/store';

function Foo() {
  const effectsLoading = store.useModelEffectsLoading('foo');
  const effectsError = store.useModelEffectsError('foo');

  effectsLoading.foo; // boolean

  effectsError.foo.value; // boolean
  effectsError.foo.error; // Error
  return null;
}
```

#### withModelEffectsState

1.2:

```jsx
import store from '@/store';
const { withModelEffectsState } = store;

class TodoList extends Component {
  onRemove = (index) => {
    const effectsState = this.props.todosEffectsState;
    effectsState.foo.isLoading;
    effectsState.foo.error;
  }
}

export default withModelEffectsState('todos')(TodoList);
```

1.3:

```jsx
import compose from 'lodash/fp/compose';
const { withModelEffectsLoading, withModelEffectsError } = store;

class TodoList extends Component {
  onRemove = (index) => {
    const effectsLoading = this.props.todosEffectsLoading;
    const effectsError = this.props.todosEffectsError;
    effectsLoading.foo; // boolean

    effectsError.foo.value; // boolean
    effectsError.foo.error; // Error
  }
}

export default compose(withModelEffectsLoading('todos'), withModelEffectsError('todos'))(TodoList);
```

### Types

_todo_

## 1.0 to 1.3

From 1.0 to 1.3 is fully compatible, but we recommend that you use the new API in incremental code.
We will remove the deprecated API in future versions.

### Define Model Actions

_todo_

### Use Model Actions State

#### useModelActionsState

_todo_

#### withModelActionsState

_todo_

## 0.x to 1.x

### Define Model

#### 0.x

```ts
import user from './user';

const store = {
  dataSource: [],
  async refresh() {
    await delay(2000);

    this.dataSource = [
      {
        name: 'react',
      },
      {
        name: 'vue',
        done: true,
      },
      {
        name: 'angular',
      },
    ],
    user.setTodos(this.dataSource.length);
  },
  add(todo) {
    this.dataSource.push(todo);
    user.setTodos(this.dataSource.length);
  },
};
```

#### 1.x

```ts
import store from '@/store';
const todos = {
  state: {
    dataSource: [],
  },
  reducers: {
    add(state, todo) {
      state.dataSource.push(todo);
    },
  },
  effects: (dispatch) => ({
    add() {
      dispatch.user.setTodos(store.getModelState('todos').dataSource.length);
    },,
    async refresh(state, payload, actions, globalActions) {
      await delay(2000);

      const dataSource = [
        {
          name: 'react',
        },
        {
          name: 'vue',
          done: true,
        },
        {
          name: 'angular',
        },
      ];
      this.update({
        dataSource,
      });

      dispatch.user.setTodos(dataSource.length);
    },
  }),
};
```

### Create store

#### 0.x

```js
import Icestore from '@ice/store';
import * as stores from './stores';

const icestore = new Icestore();
export default icestore.registerStores(stores);
```

#### 1.x

```js
import { createStore } from '@ice/store';
import * as models from './models';

export default createStore(models);
```

### Consume model

#### 0.x

```js
function App() {
  const todos = stores.useStore('todos');
  const { dataSource, add } = todos;
}
```

#### 1.x

```js
function App() {
  const [ state, actions ] = store.useModel('todos');
  const { dataSource } = state;
  const { add } = actions;
}
```

### Binding View

#### 0.x

No need.

#### 1.x

```js
const { Provider } = store;
ReactDOM.render(<Provider>
  <App />
</Provider>, document.getElementById('root'));
```
