[English](./README.md) | 简体中文

# icestore

> 简单友好的状态管理方案。

[![NPM version](https://img.shields.io/npm/v/@ice/store.svg?style=flat)](https://npmjs.org/package/@ice/store)
[![Package Quality](https://npm.packagequality.com/shield/@ice%2Fstore.svg)](https://packagequality.com/#?package=@ice/store)
[![build status](https://img.shields.io/travis/ice-lab/icestore.svg?style=flat-square)](https://travis-ci.org/ice-lab/icestore)
[![NPM downloads](http://img.shields.io/npm/dm/@ice/store.svg?style=flat)](https://npmjs.org/package/@ice/store)
[![Known Vulnerabilities](https://snyk.io/test/npm/@ice/store/badge.svg)](https://snyk.io/test/npm/@ice/store)
[![David deps](https://img.shields.io/david/ice-lab/icestore.svg?style=flat-square)](https://david-dm.org/ice-lab/icestore)
[![codecov](https://codecov.io/gh/ice-lab/icestore/branch/master/graph/badge.svg)](https://codecov.io/gh/ice-lab/icestore)

<table>
  <thead>
    <tr>
      <th colspan="5"><center>🕹 CodeSandbox demos 🕹</center></th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><a href="https://codesandbox.io/s/github/ice-lab/icestore/tree/master/examples/counter?module=/src/index.tsx">Counter</a></td>
      <td><a href="https://codesandbox.io/s/github/ice-lab/icestore/tree/master/examples/todos?module=/src/index.tsx">Todos</a></td>
    </tr>
  </tbody>
</table>

## 安装

icestore 是面向 React 应用的、简单友好的状态管理方案。它包含以下核心特征：

* **简单、熟悉的 API**：不需要额外的学习成本，只需要了解 React Hooks，对 Redux 用户友好。
* **集成异步处理**：记录异步操作时的执行状态，简化视图中对于等待或错误的处理逻辑。
* **支持组件 Class 写法**：友好的兼容策略可以让老项目享受轻量状态管理的乐趣。
* **良好的 TypeScript 支持**：提供完整的 TypeScript 类型定义，在 VS Code 中能获得完整的类型检查和推断。

查看[《能力对比表》](docs/recipes.md#Comparison)了解更多细节。

## 快速开始

```jsx
import React from 'react';
import ReactDOM from 'react-dom';
import { createStore } from '@ice/store';

const delay = (time) => new Promise((resolve) => setTimeout(() => resolve(), time));

// 1️⃣ 使用模型定义你的状态
const counter = {
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
};

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

## 文档

- [API](./docs/api.zh-CN.md)
- [更多技巧](./docs/recipes.zh-CN.md)
- [从老版本升级](./docs/upgrade-guidelines.zh-CN.md)
- [从其他方案迁移](./docs/migration.zh-CN.md)
- [常见问题](./docs/qna.zh-CN.md)

## 示例

- [Counter](https://codesandbox.io/s/github/ice-lab/icestore/tree/master/examples/counter)
- [Todos](https://codesandbox.io/s/github/ice-lab/icestore/tree/master/examples/todos)
- [Class Component Support](https://codesandbox.io/s/github/ice-lab/icestore/tree/master/examples/classComponent)
- [withModel](https://codesandbox.io/s/github/ice-lab/icestore/tree/master/examples/withModel)

## 浏览器支持

| ![Chrome](https://raw.github.com/alrra/browser-logos/master/src/chrome/chrome_48x48.png) | ![Firefox](https://raw.github.com/alrra/browser-logos/master/src/firefox/firefox_48x48.png) | ![Edge](https://raw.github.com/alrra/browser-logos/master/src/edge/edge_48x48.png) | ![IE](https://raw.github.com/alrra/browser-logos/master/src/archive/internet-explorer_9-11/internet-explorer_9-11_48x48.png) | ![Safari](https://raw.github.com/alrra/browser-logos/master/src/safari/safari_48x48.png) | ![Opera](https://raw.github.com/alrra/browser-logos/master/src/opera/opera_48x48.png) | ![UC](https://raw.github.com/alrra/browser-logos/master/src/uc/uc_48x48.png) |
| :--------------------------------------------------------------------------------------: | :-----------------------------------------------------------------------------------------: | :--------------------------------------------------------------------------------: | :--------------------------------------------------------------------------------------------------------------------------: | :--------------------------------------------------------------------------------------: | :-----------------------------------------------------------------------------------: | :--------------------------------------------------------------------------: |
|✔ |✔|✔|9+ ✔|✔|✔|✔|

## 灵感

创造 icestore 的灵感来自于 [rematch](https://github.com/rematch/rematch) 和 [constate](https://github.com/diegohaz/constate)。

## 参与贡献

欢迎通过 [issue](https://github.com/ice-lab/icestore/issues/new) 反馈问题。

如果对 `icestore` 感兴趣，请参考 [CONTRIBUTING.md](https://github.com/alibaba/ice/blob/master/.github/CONTRIBUTING.md) 学习如何贡献代码。

## License

[MIT](LICENSE)
