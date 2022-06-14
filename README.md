简体中文 | [English](./README.en.md)

# icestore

> 简单友好的状态管理方案。

[![NPM version](https://img.shields.io/npm/v/@ice/store.svg?style=flat)](https://npmjs.org/package/@ice/store)
[![build status](https://github.com/ice-lab/icestore/actions/workflows/ci.yml/badge.svg)](https://github.com/ice-lab/icestore/actions/workflows/ci.yml)
[![NPM downloads](http://img.shields.io/npm/dm/@ice/store.svg?style=flat)](https://npmjs.org/package/@ice/store)
[![codecov](https://codecov.io/gh/ice-lab/icestore/branch/master/graph/badge.svg)](https://codecov.io/gh/ice-lab/icestore)

## 版本

| 版本 | 代码分支 | 文档 |
| --- | --- | --- |
| V2  | master     |  [Docs](https://github.com/ice-lab/icestore#文档)
| V1  | stable/1.x |  [Docs](https://github.com/ice-lab/icestore/tree/stable/1.x#documents)

## 介绍

icestore 是面向 React 应用的、简单友好的状态管理方案。它包含以下核心特征：

* **简单、熟悉的 API**：不需要额外的学习成本，只需要了解 React Hooks，对 Redux 用户友好。
* **集成异步处理**：记录异步操作时的执行状态，简化视图中对于等待或错误的处理逻辑。
* **支持组件 Class 写法**：友好的兼容策略可以让老项目享受轻量状态管理的乐趣。
* **良好的 TypeScript 支持**：提供完整的 TypeScript 类型定义，在 VS Code 中能获得完整的类型检查和推断。

查看[《能力对比表》](docs/recipes.md#Comparison)了解更多细节。

## 文档

- [API](./docs/api.md)
- [更多技巧](./docs/recipes.md)
- [从 V1 版本升级](./docs/upgrade-guidelines.md)
- [常见问题](./docs/qna.md)

## 示例

- [Counter](https://codesandbox.io/s/github/ice-lab/icestore/tree/master/examples/counter)
- [Todos](https://codesandbox.io/s/github/ice-lab/icestore/tree/master/examples/todos)
- [Class Component Support](https://codesandbox.io/s/github/ice-lab/icestore/tree/master/examples/classComponent)
- [withModel](https://codesandbox.io/s/github/ice-lab/icestore/tree/master/examples/withModel)

## 快速开始

```jsx
import React from 'react';
import ReactDOM from 'react-dom';
import { createStore, createModel } from '@ice/store';

const delay = (time) => new Promise((resolve) => setTimeout(() => resolve(), time));

// 1️⃣ 使用模型定义你的状态
const counter = createModel({
  state: 0,
  reducers: {
    increment:(prevState) => prevState + 1,
    decrement:(prevState) => prevState - 1,
  },
  effects: () => ({
    async asyncDecrement() {
      await delay(1000);
      this.decrement();
    },
  })
});

const models = {
  counter,
};

// 2️⃣ 创建 Store
const store = createStore(models);


// 3️⃣ 消费模型
const { useModel } = store;
function Counter() {
  const [ count, dispatchers ] = useModel('counter');
  const { increment, asyncDecrement } = dispatchers;
  return (
    <div>
      <span>{count}</span>
      <button type="button" onClick={increment}>+</button>
      <button type="button" onClick={asyncDecrement}>-</button>
    </div>
  );
}

// 4️⃣ 绑定视图
const { Provider } = store;
function App() {
  return (
    <Provider>
      <Counter />
    </Provider>
  );
}

const rootElement = document.getElementById('root');
ReactDOM.render(<App />, rootElement);
```

## 安装

使用 icestore 需要 React 在 16.8.0 版本以上。

```bash
npm install @ice/store --save
```

## 灵感

创造 icestore 的灵感来自于 [rematch](https://github.com/rematch/rematch) 和 [constate](https://github.com/diegohaz/constate)。

## 参与贡献

欢迎通过 [issue](https://github.com/ice-lab/icestore/issues/new) 反馈问题。

开发:

```bash
$ cd icestore/
$ npm install
$ npm run test
$ npm run watch

$ cd examples/counter
$ npm install
$ npm link ../../                    # link icestore
$ npm link ../../node_modules/react  # link react
$ npm start
```

## License

[MIT](LICENSE)
