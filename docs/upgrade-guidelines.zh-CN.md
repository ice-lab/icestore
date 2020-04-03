---
id: upgrade-guidelines
title: Upgrade Guidelines
---

[English](./upgrade-guidelines.md) | 简体中文

## 1.2.0 to 1.3.0

1.3.0 是完全向下兼容的，但是我们推荐您在新增代码中使用最新的 API。

我们会在未来的版本中删除标记为「已过期」的 API。

### initialState

#### 1.2.0

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

#### 1.3.0

```js
import store from './store';
const { Provider } = store;

const initialState = {
  foo: {
  },
};
function App() {
  return (
    <Provider initialState={initialState}>
      <Todos />
    </Provider>
  );
}
```

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
      actions.foo(); // 调用本模型的方法
      globalActions.user.foo(); // 调用其他模型的方法
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
      this.foo(); // 调用本模型的方法
      dispatch.user.foo(); // 调用其他模型的方法
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

一些工具类型命名也发生了变更。我们在 1.3.0 中保留了老版本的工具类型，但强烈建议您使用最新的工具类型。

- ConfigPropTypeState => ExtractIModelStateFromModelConfig
- ConfigPropTypeEffects => ExtractIModelEffectsFromModelConfig
- ConfigPropTypeReducers => ExtractIModelReducersFromModelConfig
- ModelEffects => ExtractIModelDispatchersFromEffects
- ModelActions => ExtractIModelDispatchersFromModelConfig
- ModelEffectsState => ExtractIModelEffectsStateFromModelConfig
- UseModelValue => ExtractIModelFromModelConfig

## 1.0.0 to 1.3.0

1.3.0 是完全向下兼容的，但是我们推荐您在新增代码中使用最新的 API。

我们会在未来的版本中删除标记为「已过期」的 API。

### Define Model Actions

#### 1.0.0

```js
const todos = {
  actions: {
    increment:(prevState) => prevState + 1,
    async incrementAsync(state, payload, actions) {
      await delay(1000);
      actions.increment();
    }
  }
}
```

#### 1.3.0

```js
const todos = {
  reducers: {
    increment:(prevState) => prevState + 1,
  },
  effects: () => ({
    async incrementAsync() {
      await delay(1000);
      this.increment();
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

## 0.x.x to 1.x.x

从 0.x.x 到 1.x.x 是不兼容的。您可以选择性地进行升级。

但 0.x.x 有一些已知的缺陷，您必须知晓：https://github.com/alibaba/ice/issues/3037

### Define Model

#### 0.x.x

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
      this.update({
        dataSource,
      });

      dispatch.user.setTodos(dataSource.length);
    },
  }),
};
```

### Create store

#### 0.x.x

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

#### 0.x.x

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

#### 0.x.x

No need.

#### 1.x.x

```js
const { Provider } = store;
ReactDOM.render(<Provider>
  <App />
</Provider>, document.getElementById('root'));
```
