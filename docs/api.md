---
id: api
title: API
---

`createStore` 是 @ice/store 的 API 主要入口。创建后的 Store 将提供一些 Hooks 和 API 用于访问和操作数据。

`createModel` 是一个类型工具方法，无任何副作用。用它来包裹你的 model 对象，在 effects 中使用 `this` 时可获得完整的类型提示。

## createModel

`createModel(modelConfig)`

该方法用于包裹 model 对象，以获得更好的类型提示。

```ts
import { createModel } from '@ice/store';

type IState = {
  count: number,
};
const state: IState = {
  count: 0,
};

const counter = createModel({
  state,
  reducers: {
    increment(state: IState, payload: number) {
      return state.count + payload;
    },
    decrement(state: IState, payload: number) {
      return state.count - payload;
    },
  },
  effects: () => ({
    async asyncDecrement(payload: number) {
      this.decrement(payload);
    },
    async anotherEffect(payload: number) {
      this.asyncDecrement(payload);
    },
  }),
});

const models = {
  counter,
}
```

## createStore

`createStore(models, options)`

该方法用于创建 Store。

```js
import { createStore } from '@ice/store';

const {
  // 主要的 API
  Provider,
  useModel,
  getModel,
  withModel,

  // 辅助的 API
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

`createStore({ [string]: modelConfig });`

```js
import { createStore, createModel } from '@ice/store'

const count = createModel({
  state: 0,
});

createStore({
  count
});
```

##### state

`state: any`: 必填

该 model 的初始 state。

```js
import { createModel } from '@ice/store';

const model = createModel({
  state: { loading: false },
});
```

##### reducers

`reducers: { [string]: (state, payload) => any }`

一个改变该模型状态的函数集合。这些方法以模型的上一次 state 和一个 payload 作为入参，在方法中使用可变的方式来更新状态。
这些方法应该是仅依赖于 state 和 payload 参数来计算下一个 state 的纯函数。对于有副作用的函数，请使用 effects。

一个简单的示例：

```js
import { createModel } from '@ice/store';

const todos = createModel({
  state: [
    {
      title: 'Learn typescript',
      done: true,
    },
  ],
  reducers: {
    foo(state) {
      state.push({ title: 'Tweet about it' }); // 直接更新了数组
      state[1].done = true;
    },
  },
});
```

icestore 内部是通过调用 [immer](https://github.com/immerjs/immer) 来实现可变状态的。
Immer 只支持对普通对象和数组的变化检测，所以像字符串或数字这样的类型需要返回一个新值。 例如：

```js
import { createModel } from '@ice/store';

const count = createModel({
  state: 0,
  reducers: {
    add(state) {
      state += 1;
      return state;
    },
  },
});
```

参考 [docs/recipes](./recipes.md#可变状态的说明) 了解更多。

reducer 的第二个参数即是调用时传递的参数：

```js
import { createModel } from '@ice/store';

const todos = createModel({
  state: [
    {
      title: 'Learn typescript',
      done: true,
    },
  ],
  reducers: {
    // 正确用法
    add(state, todo) {
      state.push(todo);
    },
    // 错误用法
    add(state, title, done) {
      state.push({ title, done });
    },
  },
});

// 使用时：
function Component() {
  const { add } = store.useModelDispatchers('todos');
  function handleClick () {
    add({ title: 'Learn React', done: false }); // 正确用法
    add('Learn React', false); // 错误用法
  }
}
```

##### effects

`effects: (dispatch) => ({ [string]: (payload, rootState) => void })`

一个可以处理该模型副作用的函数集合。这些方法以 payload 和 rootState 作为入参，适用于进行异步调用、[模型联动](recipes.md#模型联动)等场景。在 effects 内部，通过调用 `this.reducerFoo` 来更新模型状态：

```js
import { createModel } from '@ice/store';

const counter = createModel({
  state: 0,
  reducers: {
    decrement:(prevState) => prevState - 1,
  },
  effects: () => ({
    async asyncDecrement() {
      await delay(1000); // 进行一些异步操作
      this.decrement(); // 调用模型 reducers 内的方法来更新状态
    },
  }),
});
```

> 注意：如果您正在使用 TypeScript ，并且配置了编译选项 `noImplicitThis: ture`，则会遇到类似 "Property 'setState' does not exist on type" 的编译错误。您可以[参考qna中的用法](qna.md)使用 `createModel` 来包裹你的 model，或者使用下面示例中的 `dispatch.model.reducer` 来避免此错误。

###### 同名处理

如果 reducers 和 effects 中的方法重名，则会在先执行 reducer.foo 后再执行 effects.foo：

```js
import { createModel } from '@ice/store';

const model = createModel({
  state: [],
  reducers: {
    add(state, todo) {
      state.push(todo);
    },
  },
  effects: (dispatch: RootDispatch) => ({
    // 将会在 reducers.add 执行完成后再执行该方法
    add(todo) {
      dispatch.user.setTodos(store.getModelState('todos').length);
    },
  })
});
```

###### this.setState

icestore 内置提供了名为 `setState` reducer ，其作用类似于 React Class 组件中的 [setState](https://zh-hans.reactjs.org/docs/react-component.html#setstate)，但仅支持一个参数且参数是对象类型。

```js
this.setState(stateChange);

// stateChange 会将传入的对象浅层合并到新的 state 中，例如，调整购物车商品数：
this.setState({quantity: 2});
```

setState 的 reducer 内部实现类似于：

```js
const setState = (prevState, payload) => ({
  ...prevState,
  ...payload,
});
```

您可以通过在 reducers 中声明 `setState` 来覆盖默认的行为：

```js
import { createModel } from '@ice/store';

const model = createModel({
  state: { count: 0, calledCounter: 0 },
  reducers: {
    setState: (prevState, payload) => ({
      ...prevState,
      ...payload,
      calledCounter: prevState.calledCounter + 1,
    })
  },
  effects: () => ({
    foo() {
      this.setState({ count: 1 });
    }
  })
})
```

###### 模型联动

您可以通过声明 effects 函数的第一个参数 `dispatch` 来调用其他模型的方法：

```js
import { createStore, createModel } from '@ice/store';

const user = createModel({
  state: {
    foo: [],
  },
  effects: (dispatch) => ({
    like(payload, rootState) {
      this.doSomething(payload); // 调用 user 内的其他 effect 或 reducer
      // 另一种调用方式：dispatch.user.doSomething(payload);
      dispatch.todos.foo(payload); // 调用其他模型的 effect 或 reducer
    },
    doSomething(payload) {
      // ...
      this.foo(payload);
    }
  }),
  reducers: {
    foo(prevState, payload) {
      return {
        ...prevState,
      };
    },
  }
});

const todos = { /* ... */ };

const store = createStore({ user, todos });
```

参考 [docs/recipes](./recipes.md#模型联动) 了解更多。

#### options

- `disableImmer` (布尔值, 可选, 默认值=false)

  如果您将其设置为true，那么 immer 将被禁用，这意味着您不能再在 reducers 中直接改变状态，而是必须返回新的状态。

- `disableError` (布尔值, 可选, 默认值=false)

  如果将此设置为true，则 “UseModelEffectsError” 和 “WithModelEffectsError” 将不可用。仅当您非常关注性能或故意抛出错误时才启用该选项。

- `disableLoading` (布尔值, 可选, 默认值=false)

  如果将此设置为true，则“useModelEffectsLoading”和“withModelEffectsLoading”将不可用。

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

允许您声明初始状态（可以用在诸如服务端渲染等场景）。

```jsx
import { createStore, createModel } from '@ice/store';

const models = {
  todo: createModel({ state: {} }),
  user: createModel({ state: {}, }),
};

const store = createStore(models);
const { Provider } = store;

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
function App() {
  return (
    <Provider initialStates={initialStates}>
      <App />
    </Provider>
  );
}
```

#### useModel

`useModel(name: string): [ state, dispatchers ]`

通过该 hooks 使用模型，返回模型的状态和调度器。

```jsx
import { createModel } from '@ice/store';

const counter = createModel({
  state: {
    value: 0,
  },
  reducers: {
    add: (state, payload) => {
      state.value = state.value + payload;
    },
  },
});

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

#### useModelState

`useModelState(name: string): state`

通过该 hooks 使用模型的状态并订阅其更新。

```js
function FunctionComponent() {
  const state = useModelState('counter');
  console.log(state.value);
}
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

`useModelEffectsLoading(name: string): { [actionName: string]: boolean }`

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

`useModelEffectsError(name: string): { [actionName: string]: { error: Error; value: boolean;}}`

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

你可以使用 `mapModelDispatchersToProps` 来设置 props 的字段名，用法同 `mapModelToProps`。

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

## withModel

`withModel(model, mapModelToProps?, options?)(ReactFunctionComponent)`

该方法用于在组件中快速使用 Model。

```js
import { withModel } from '@ice/store';
import model from './model';

function Todos({ model }) {
  const {
    useState,
    useDispatchers,
    useEffectsState,
    getState,
    getDispatchers,
  } = model;
  const [ state, dispatchers ] = useValue();
}

export default withModel(model)(Todos);
```

### 参数

#### modelConfig

与 createStore 方法中的 modelConfig 一致。

#### mapModelToProps

`mapModelToProps = (model) => ({ model })`

使用该函数来自定义映射到组件中的值，使用示例：

```js
import { withModel } from '@ice/store';
import model from './model';

function Todos({ todo }) {
  const [ state, dispatchers ] = todo.useValue();
}

export default withModel(model, function(model) {
  return { todo: model };
})(Todos);
```

#### options

与 createStore 方法中的 options 一致。

### 返回值

- useValue
- useState
- useDispathers
- useEffectsState
- getValue
- getState
- getDispatchers
- withValue
- withDispatchers
- withModelEffectsState

其用法参考 createStore 的返回值。
