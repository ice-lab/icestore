---
id: upgrade-guidelines
title: Upgrade Guidelines
---

English | [简体中文](./upgrade-guidelines.zh-CN.md)

## Upgrade from 1.2.0 to 1.3.0

From 1.2.0 to 1.3.0 is fully compatible, but we recommend that you use the new API in incremental code.
We will remove the deprecated API in future versions.

### Define Model Effects

#### 1.2.0

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

#### 1.3.0

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

#### 1.2.0

```jsx
import store from '@/store';

function Foo() {
  const actions = store.useModelActions('foo');
  actions.foo();
  return null;
}
```

#### 1.3.0

```jsx
import store from '@/store';

function Foo() {
  const dispatchers = store.useModelDispatchers('foo');
  dispatchers.foo();
  return null;
}
```

#### withModelActions

#### 1.2.0

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

#### 1.3.0

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

### Utility Types

- ConfigPropTypeState => ExtractIModelStateFromModelConfig
- ConfigPropTypeEffects => ExtractIModelEffectsFromModelConfig
- ConfigPropTypeReducers => ExtractIModelReducersFromModelConfig
- ModelEffects => ExtractIModelDispatchersFromEffects
- ModelActions => ExtractIModelDispatchersFromModelConfig
- ModelEffectsState => ExtractIModelEffectsStateFromModelConfig
- UseModelValue => ExtractIModelFromModelConfig

## Upgrade from 1.0.0 to 1.3.0

From 1.0.0 to 1.3.0 is fully compatible, but we recommend that you use the new API in incremental code.
We will remove the deprecated API in future versions.

### Define Model Actions

#### 1.0.0

```js
const counter = {
  state: {
    value: 0,
  },
  actions: {
    increment:(state) => ({ value: state.value + 1 }),
    async asyncIncrement(state, payload, actions, globalActions) {
      console.log(state); // 0
      await delay(1000);
      actions.increment();
      globalActions.todo.refresh();
    },
    async asyncDecrement(state) {
      await delay(1000);
      return { value: state.value - 1 };
    },
  }
}
```

#### 1.3.0

```js
const counter = {
  state: {
    value: 0,
  },
  reducers: {
    increment:(prevState) => ({ value: prevState.value + 1 }),
  },
  effects: (dispatch) => ({
    async asyncIncrement(payload, rootState) {
      console.log(rootState.counter); // 0
      await delay(1000);
      this.increment();
      dispatch.todo.refresh();
    },
    async asyncDecrement(payload, rootState) {
      await delay(1000);
      this.setState({ value: rootState.counter.value - 1 }); // setState is a built-in reducer
    },
  }),
}
```

### Use Model Actions State

#### useModelActionsState

##### 1.2.0

```js
import store from '@/store';

function Foo() {
  const actionsState = store.useModelActionsState();
  actionsState.foo.isLoading; // boolean
  actionsState.foo.error; // Error
}
```

##### 1.3.0

```js
import store from '@/store';

function Foo() {
  const effectsState = store.useModelEffectsState();
  effectsState.foo.isLoading; // boolean
  effectsState.foo.error; // Error
}
```

#### withModelActionsState

##### 1.2.0

```jsx	
import store from '@/store';	
const { withModelActionsState } = store;	
class TodoList extends Component {	
  onRemove = (index) => {	
    const actionsState = this.props.todosActionsState;	
    actionsState.foo.isLoading;	
    actionsState.foo.error;	
  }	
}	
export default withModelActionsState('todos')(TodoList);	
```

##### 1.3.0

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

## Upgrade from 0.4.x to 1.x.x

### Define Model

#### 0.4.x

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

#### 1.x.x

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
    async refresh(payload, rootState) {
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
      this.setState({
        dataSource,
      });

      dispatch.user.setTodos(dataSource.length);
    },
  }),
};
```

### Create store

#### 0.4.x

```js
import Icestore from '@ice/store';
import * as stores from './stores';

const icestore = new Icestore();
export default icestore.registerStores(stores);
```

#### 1.x.x

```js
import { createStore } from '@ice/store';
import * as models from './models';

export default createStore(models);
```

### Consume model

#### 0.4.x

```js
function App() {
  const todos = stores.useStore('todos');
  const { dataSource, add } = todos;
}
```

#### 1.x.x

```js
function App() {
  const [ state, dispatchers ] = store.useModel('todos');
  const { dataSource } = state;
  const { add } = dispatchers;
}
```

### Binding View

#### 0.4.x

No need.

#### 1.x.x

```js
const { Provider } = store;
ReactDOM.render(<Provider>
  <App />
</Provider>, document.getElementById('root'));
```

## Upgrade from 0.1.x to 0.4.x

### Create Stores

#### 0.1.0

```js
import todos from './todos';
import user from './user';
import Icestore from '@ice/store';

const icestore = new Icestore();
icestore.registerStore('todos', todos);
icestore.registerStore('user', user);

export default icestore;
```

#### 0.4.0

```js
import todos from './todos';
import user from './user';
import Icestore from '@ice/store';

const icestore = new Icestore();
const stores = icestore.registerStores({
  todos,
  user,
});

export default stores;
```

### Use Store

#### 0.1.0

```js
function Todo() {
  const todos = stores.useStore('todos');
  const { dataSource } = todos;

  useEffect(() => {
    async function refresh() {
      const newTodos = await todos.refresh();
      console.log(newTodos.dataSource);
    }
    refresh();
  }, []);

  return (
    <div>
      {dataSource.map(({ name }) => (
        <div>{name}</div>
      ))}
    </div>
  );
};
```

#### 0.4.0

```js
function Todo() {
  const todos = stores.useStore('todos');
  const { dataSource } = todos;

  useEffect(() => {
     async function refresh() {
      await todos.refresh();
      const newTodos = stores.getState('todos');
      console.log(newTodos.dataSource);
    }
    refresh();
  }, []);

  return (
    <div>
      {dataSource.map(({ name }) => (
        <div>{name}</div>
      ))}
    </div>
  );
};
```
