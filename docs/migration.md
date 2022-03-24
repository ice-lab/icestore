---
id: migration
title: 从其他方案迁移
---

[English](./migration.md) | 简体中文

## 从 Redux 迁移

我们提供了渐进式的方案使得您的项目可以局部从 Redux 迁移到 icestore。

> 请确保在项目中使用的 react-redux >= 7.0.0 且 react >= 16.8.0 。

### 第一步：替换 createStore 方法

参考：[CodeSandbox](https://codesandbox.io/s/github/ice-lab/icestore/tree/master/examples/migration-redux-1?module=/src/index.js)

#### Redux 创建 Store 的方式

```js
import { createStore, combineReducers } from 'redux';

import sharks from './reducers/sharks';
import dolphins from './reducers/dolphins';

const rootReducer = combineReducers({
  sharks,
  dolphins
});
const store = createStore(rootReducer);
```

#### icestore 创建 Store 的方式

```js
import { createStore } from 'icestore';

import sharks from './reducers/sharks';
import dolphins from './reducers/dolphins';

// 使用 icestore 的 createStore 方法
const store = createStore(
  { /* No models */ },
  {
    redux: {
      reducers: {
        sharks,
        dolphins
      }
    }
  }
);
```

### 第二步：将 reducer 替换为 model

您可以局部渐进式地将项目中的 Redux reducer 替换为 icestore model。

参考：[CodeSandbox](https://codesandbox.io/s/github/ice-lab/icestore/tree/master/examples/migration-redux-2?module=/src/index.js)

#### 声明层

##### Redux 中 reducer 的声明

```js
const INCREMENT = 'sharks/increment';

export const incrementSharks = (payload) => ({
  type: INCREMENT,
  payload,
});

export default (state = 0, action) => {
  switch(action.type) {
    case INCREMENT:
      return state + action.payload;
    default:
      return state;
  }
};
```

##### icestore 中 model 的声明

```js
export default {
  state: 0,
  reducers: {
    increment: (state, payload) => state + payload
  }
}
```

#### 消费层

##### Redux 中 mapDispatch 的返回值

```js
import { connect } from 'react-redux';
import { incrementSharks } from './reducers/sharks';
import { incrementDolphins } from './reducers/dolphins';

const mapDispatch = dispatch => ({
  incrementSharks: () => dispatch(incrementSharks(1)),
  incrementDolphins: () => dispatch(incrementDolphins(1))
});

export default connect(undefined, mapDispatch)(ReactComponent);
```

##### icestore 中 mapDispatch 的返回值

```js
import { connect } from 'react-redux';
import { incrementDolphins } from './reducers/dolphins';

const mapDispatch = dispatch => ({
  // 注意这一行的区别！
  incrementSharks: () => dispatch.sharks.increment(1),
  incrementDolphins: () => dispatch(incrementDolphins(1)),
});

export default connect(undefined, mapDispatch)(ReactComponent);
```

### 第三步：替换 Provider 

参考：[CodeSandbox](https://codesandbox.io/s/github/ice-lab/icestore/tree/master/examples/migration-redux-3?module=/src/index.js)

#### 将 react-redux Provider 替换为 icestore Provider

##### react-redux

```js
import { Provider } from 'react-redux';
import App from './App';
import store from './store';

const Root = () => (
  <Provider store={store}>
    <App />
  </Provider>
);
```

##### icestore

```js
import App from './App';
import store from './store';

const Root = () => (
  <store.Provider>
    <App />
  </store.Provider>
);
```

#### 兼容 react-redux Hooks

##### 原 react-redux Hooks 用法

```js
import { useSelector, useDispatch } from 'react-redux';

export default function() {
  const sharks = useSelector(state => state.sharks);
  const dispatch = useDispatch();
  dispatch.sharks.increment();
}
```

##### 兼容做法

```js
import { createSelectorHook, createDispatchHook } from 'react-redux';
import store from './store';

// 使用 store 提供的 context 创建 Redux Hooks
const useSelector = createSelectorHook(store.context);
const useDispatch = createDispatchHook(store.context);

export default function() {
  const sharks = useSelector(state => state.sharks);
  const dispatch = useDispatch();
  dispatch.sharks.increment();
}
```

#### 兼容 react-redux connect

##### 原 react-redux connect 用法

```js
import { connect } from 'react-redux';

export default connect(
  mapState,
  mapDispatch
)(ReactComponent);
```

##### 兼容做法

```js
import { connect } from 'react-redux';
import store from './store';

export default connect(
  mapState,
  mapDispatch,
  mergeProps,

  // 传递 store 提供的 context 给 connect 函数
  { context: store.context }
)(ReactComponent);
```

### 第四步：将 react-redux 替换为 icestore 

您可以局部渐进式地将项目中的 react-redux API 替换为 icestore API。

参考：[CodeSandbox](https://codesandbox.io/s/github/ice-lab/icestore/tree/master/examples/migration-redux-4?module=/src/index.js)

#### 替换 react-redux Hooks

```js
import { useSelector, useDispatch } from './reudx';
import store from './store';

function Component (){
  // const sharks = useSelector(state => state.sharks);
  const sharks = store.useModelState('sharks');
  // const dispatch = useDispatch();
  // dispatch.sharks.increment();
  const dispatchers = store.useModelDispathers('sharks');
  dispatchers.increment();
}
```

#### 替换 react-redux connect

##### 原 react-redux connect 用法

```js
import { connect } from 'react-reudx';

function Count(props) {
  console.log(props.dolphins);
  props.incrementDolphins();
}

const mapState = state => ({
  dolphins: state.dolphins
});

const mapDispatch = dispatch => ({
  incrementDolphins: dispatch.dolphins.increment
});

export default connect(
  mapState,
  mapDispatch,
  undefined,
  { context: store.context }
)(Count);
```

##### 使用 icestore API

```js
import store from './store';
const { withModel } = store;

function Count(props) {
  const [dolphins, { increment }] = props.dolphins;
  console.log(dolphins);
  increment();
}

withModel('dolphins')(Count);
```
