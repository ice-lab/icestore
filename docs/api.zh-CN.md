---
id: api
title: API
---

[English](./api.md) | 简体中文

`createStore` 是 icestore 的 API 主要入口。创建后的 Store 将提供一些 Hooks 和 API。

## createStore

`createStore(models, options)`

该方法用于创建 store。

```js
import { createStore } from '@ice/store';

const { 
  // 主要的 apis
  Provider,
  useModel,
  getModel,
  withModel,

  // 辅助的 apis
  useModelDispatchers,
  useModelEffectsState,
  withModelDispatchers,
  withModelEffectsState,
  getModelState,
  getModelDispatchers,
} = createStore(models);
```

### 参数

#### models

##### state

`state: any`: 必填

该 model 的初始 state。

```js
const model = {
  state: { loading: false },
};
```

##### reducers

`reducers: { [string]: (prevState, payload) => any }`

一个改变该 model state 的所有函数的对象。这些函数采用 model 的上一次 state 和一个 payload 作为入参，并且返回 model 的下一个状态。这些函数应该是仅依赖于 state 和 payload 参数来计算下一个 state 的纯函数。对于不纯的函数，如 API 调用等的代码，请使用 effects。

```js
const counter = {
  state: 0,
  reducers: {
    add: (state, payload) => state + payload,
  }
};
```

reducer 可以使用可变的方式来更新状态。在内部，我们是通过调用 [immer](https://github.com/immerjs/immer) 来实现的。例如：

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

在 Immer 中，reducer 对 state 进行变更检测以实现下一个不可变状态。Immer 只支持对普通对象和数组的变化检测，所以像字符串或数字这样的原始值需要返回一个新值。 例如：

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

参考 [docs/recipes](./recipes.zh-CN.md#immutable-description) 了解更多。

##### effects

`effects: (dispatch) => ({ [string]: (payload, rootState) => void })`

一个可以处理该模型副作用的函数对象。当与 async/await 一起使用时，Effects 提供了一种处理异步 action 方案：

```js
const counter = {
  state: { count: 0 },
  effects: (dispatch) => ({
    async add(payload, rootState) {
      // wait for data to load
      const response = await fetch('http://example.com/data');
      const data = await response.json();
      // pass the result to a local reducer
      this.update(data);
    },
  }),
};
```

您可以通过调用 `dispatch` 来调用其他模型的方法：

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

- `initialState` (对象, 可选, 默认值=undefined)

  允许您声明初始状态（可以用在诸如服务端渲染等场景）。

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
- `disableImmer` (布尔值, 可选, 默认值=false)

  如果您将其设置为true，那么 immer 将被禁用，这意味着您不能再在 reducer 中直接改变状态，而是必须返回新的状态。
- `disableError` (布尔值, 可选, 默认值=false)

  如果将此设置为true，则“UseModelEffectsRor”和“WithModelEffectsRor”将不可用。仅当您非常关注性能或故意抛出错误时才启用该选项。

  > 我们将会在未来的版本中默认开启该选项。
- `disableLoading` (布尔值, 可选, 默认值=false)

  如果将此设置为true，则“useModelEffectsLoading”和“withModelEffectsLoading”将不可用。

  > 我们将会在未来的版本中默认开启该选项

### 返回值

#### Provider

`Provider(props: { children })`

将 store 和 React 应用进行绑定，因此可以在组件中使用 store 提供的 hooks。

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

通过该 hooks 使用模型，返回模型的状态和调度器。

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

通过 API 获取到最新的模型，在闭包中将非常有用。

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

使用该 API 将模型绑定到 Class 组件上。

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

可以使用 `mapModelToProps` 设置 props 的字段名：

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

通过该 hooks 使用模型的调度器，通过调度器更新模型。

```js
function FunctionComponent() {
  const dispatchers = useModelDispatchers('counter');
  dispatchers.add(1);
}
```

#### useModelEffectsLoading

`useModelEffectsLoading(name: string): { [actionName: string]: boolean } `

通过该 hooks 来获取模型副作用的调用状态。

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

通过该 hooks 来获取模型副作用的调用结果是否有错误。

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

可以使用 `mapModelEffectsLoadingToProps` 参数来设置 props 的字段名，方式与 `mapModelToProps` 一致。

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

可以使用  `mapModelEffectsErrorToProps` 来设置 props 的字段名，方式与 `mapModelToProps` 一致。

#### getModelState

`getModelState(name: string): state`

通过该 API 获取模型的最新状态。

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

通过该 API 来获取模型的调度器。

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
