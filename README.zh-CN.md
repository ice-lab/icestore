[English](./README.md) | 简体中文

# icestore

> 基于 React Hooks 实现的轻量级状态管理框架

[![NPM version](https://img.shields.io/npm/v/@ice/store.svg?style=flat)](https://npmjs.org/package/@ice/store)
[![Package Quality](https://npm.packagequality.com/shield/@ice%2Fstore.svg)](https://packagequality.com/#?package=@ice/store)
[![build status](https://img.shields.io/travis/ice-lab/icestore.svg?style=flat-square)](https://travis-ci.org/ice-lab/icestore)
[![Test coverage](https://img.shields.io/codecov/c/github/ice-lab/icestore.svg?style=flat-square)](https://codecov.io/gh/ice-lab/icestore)
[![NPM downloads](http://img.shields.io/npm/dm/@ice/store.svg?style=flat)](https://npmjs.org/package/@ice/store)
[![Known Vulnerabilities](https://snyk.io/test/npm/@ice/store/badge.svg)](https://snyk.io/test/npm/@ice/store)
[![David deps](https://img.shields.io/david/ice-lab/icestore.svg?style=flat-square)](https://david-dm.org/ice-lab/icestore)

## 安装

使用 icestore 需要 React 在 16.8.0 版本以上。

```bash
$ npm install @ice/store --save
```

## 简介

icestore 是基于 React Hooks 实现的轻量级状态管理框架，具有以下特征：

* **简单、熟悉的 API**：不需要额外的学习成本，只需要声明模型，然后 `useModel`；
* **支持组件 Class 写法**：友好的兼容策略可以让老项目享受轻量状态管理的乐趣；
* **集成异步处理**：记录异步操作时的执行状态，简化视图中对于等待或错误的处理逻辑；
* **良好的 TypeScript 支持**：提供完整的 TypeScript 类型定义，在 VS Code 中能获得完整的类型检查和推断。

## 快速开始

让我们使用 icestore 开发一个简单的 Todo 应用，包含以下几个步骤：

### 第一步：定义模型

```javascript
export const todos = {
  state: {
    dataSource: [],
  },
  actions: {
    async fetch(prevState, actions) {
      await delay(1000);
      const dataSource = [
        { name: 'react' },
        { name: 'vue', done: true},
        { name: 'angular' },
      ];
      return {
        ...prevState,
        dataSource,
      }
    },
    add(prevState, todo) {
      return {
        ...prevState,
        dataSource: [
          ...prevState.dataSource,
          todo,
        ]
      };
    },
  },
};
```

### 第二步：创建 Store

```javascript
import { createStore } from '@ice/store';
import * as models from './models';

export default createStore(models);
```

### 第三步：挂载 Store

```jsx
import React from 'react';
import ReactDOM from 'react-dom';
import store from './store';

const { Provider } = store;

ReactDOM.render(
  <Provider>
    <App />
  </Provider>,
  rootEl
); 
```

### 第四步：消费模型

```jsx
import React, { useEffect } from 'react';
import store from './store';

const { useModel } = store;

function Todos() {
  const [ state, actions ] = useModel('todos');
  const { dataSource } = state;
  const { fetch, add } = actions;

  useEffect(() => {
    fetch();
  }, []);

  function onAdd(event, name) {
    if (event.keyCode === 13) {
      add({ name: event.target.value });
      event.target.value = '';
    }
  }

  return (
    <div>
      <ul>
        {dataSource.map(({ name, done }, index) => (
          <li key={index}>
            <label>
              {done ? <s>{name}</s> : <span>{name}</span>}
            </label>
          </li>
        ))}
      </ul>
      <div>
        <input
          onKeyDown={onAdd}
          placeholder="Press Enter"
        />
      </div>
    </div>
  );
}
```

## API

**createStore**

`createStore(models)`

该函数用于创建 Store，将返回一个 Provider 和一些 Hooks。

```js
import { createStore } from '@ice/store';

const store = createStore(models);
const { Provider, useModel, withModel } = store;
```

### 入参

**models**

```js
import { createStore } from '@ice/store'

const counterModel = {
  state: {
    value: 0
  },
};

const models = {
  counter: counterModel
};

createStore(models)
```

#### state

`state: any`：必填

该模型的初始 state。

```js
const model = {
  state: { loading: false },
};
```

#### actions

`actions: { [string]: (prevState, payload, actions, globalActions) => any }`

一个改变该模型 state 的所有函数的对象。这些函数采用模型的上一次 state 和一个 payload 作为形参，并且返回模型的下一个状态。

```js
const counter = {
  state: 0,
  actions: {
    add: (prevState, payload) => prevState + payload,
  }
};
```

action 可以是异步的：

```js
const counter = {
  actions: {
    async addAsync(prevState, payload) => {
      await delay(1000);
      return prevState + payload;
    },
  }
};
```

可以在返回前执行另一个 action 或者另一个模型的 actions：

```js
const user = {
  state: {
    foo: [],
  }
  actions: {
    like(prevState, payload, actions, globalActions) => {
      actions.foo(payload); // 调用本模型的 foo
      globalActions.user.foo(payload); // 调用其他模型的 foo
      
      // 做一些操作

      return {
        ...prevState,
      };
    },
    foo(prevState, id) {
      // 做一些操作

      return {
        ...prevState,
      };
    },
  }
};
```

### 返回值

#### Provider

`Provider(props: { children, initialStates })`

将 Store 挂载到 React 应用，以便组件能够通过 Hooks 使用 Store 并与 Store 进行交互。

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

在组件内使用模型实例。

```jsx
const counter = {
  state: {
    value: 0
  },
  actions: {
    add: (prevState, payload) => ({...prevState, value: prevState.value + payload}),
  }
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

useModelActions 提供了一种只使用模型的 actions 但不订阅模型更新的的方式。

```js
function FunctionComponent() {
  const actions = useModelActions('name');
  actions.add(1);
}
```

#### useModelActionsState

`useModelActionsState(name: string): { [actionName: string]: { isLoading: boolean, error: Error } } `

使用 useModelActionsState 来获取模型异步 Action 的执行状态。

```js
function FunctionComponent() {
  const actions = useModelActions('name');
  const actionsState = useModelActionsState('name');

  useEffect(() => {
    actions.fetch();
  }, []);

  actionsState.fetch.isLoading // 异步 Action 是否在执行中
  actionsState.fetch.error // 异步 Action 执行是否有误，注意仅当 isLoading 为 false 时这个值才有意义
}
```

#### withModel

`withModel(name: string, mapModelToProps?: (model: [state, actions]) => Object = (model) => ({ [name]: model }) ): (React.Component) => React.Component`

使用 withModel 来连接模型和 Class Component。

```jsx
class TodoList extends Component {
  render() {
    const { counter } = this.props;
    const [ state, actions ] = counter;
    const { dataSource } = state;
    
    state.value; // 0

    actions.add(1);
  }
} 

export default withModel('counter')(TodoList);
```

## 浏览器支持

| ![Chrome](https://raw.github.com/alrra/browser-logos/master/src/chrome/chrome_48x48.png) | ![Firefox](https://raw.github.com/alrra/browser-logos/master/src/firefox/firefox_48x48.png) | ![Edge](https://raw.github.com/alrra/browser-logos/master/src/edge/edge_48x48.png) | ![IE](https://raw.github.com/alrra/browser-logos/master/src/archive/internet-explorer_9-11/internet-explorer_9-11_48x48.png) | ![Safari](https://raw.github.com/alrra/browser-logos/master/src/safari/safari_48x48.png) | ![Opera](https://raw.github.com/alrra/browser-logos/master/src/opera/opera_48x48.png) | ![UC](https://raw.github.com/alrra/browser-logos/master/src/uc/uc_48x48.png) |
| :--------------------------------------------------------------------------------------: | :-----------------------------------------------------------------------------------------: | :--------------------------------------------------------------------------------: | :--------------------------------------------------------------------------------------------------------------------------: | :--------------------------------------------------------------------------------------: | :-----------------------------------------------------------------------------------: | :--------------------------------------------------------------------------: |
|✔ |✔|✔|9+ ✔|✔|✔|✔|

## 灵感

创造 icestore 的灵感来源于 [constate](https://github.com/diegohaz/constate) 和 [rematch](https://github.com/rematch/rematch)。

## 贡献

欢迎[反馈问题](https://github.com/alibaba/ice/issues/new)。如果对 icestore 感兴趣，请参考 [CONTRIBUTING.md](https://github.com/alibaba/ice/blob/master/.github/CONTRIBUTING.md) 学习如何贡献代码。

## 协议

[MIT](LICENSE)

