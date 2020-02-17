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

`icestore` 是基于 React Hooks 实现的轻量级状态管理框架，具有以下特征：

* **简单、熟悉的 API**：不需要额外的学习成本，只需要声明模型，然后 useModel；
* **支持组件 Class 写法**：友好的兼容策略可以让老项目享受轻量状态管理的乐趣；
* **集成异步处理**：记录异步操作时的执行状态，简化视图中对于等待或错误的处理逻辑；
* **良好的 TypeScript 支持**：提供完整的 TypeScript 类型定义，在 VS Code 中能获得完整的类型检查和推断；

## 快速开始

让我们使用 `icestore` 开发一个简单的 Todo 应用，包含以下几个步骤：

* 定义模型：

  ```javascript
  const todosModel = {
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

  export default {
    todos: todosModel
  };
  ```
* 创建 Store：

  ```javascript
  import { createStore } from '@ice/store';
  import models from './models';
  export default createStore(models);
  ```
* 连接视图：

  ```jsx

  import store from './store';
  const { Provider } = store;
  ReactDOM.render(
    <Provider>
      <App />
    </Provider>,
    rootEl
  ); 
  ```
* 消费模型：

  ```jsx
  import React, { useEffect } from 'react';
  import ReactDOM from 'react-dom';
  import store from './store';
  
  const { Provider, useModel } = store;

  function Todos() {
    const [ state, actions ] = useModel('todos');
    const { dataSource } = state;
    const { fetch, add } = actions;

    useEffect(() => {
      fetch();
    }, []);

    function handleAdd(name) {
      add({ name });
    }

    return (
      <div>
        <ul>
          {dataSource.map(({ name, done }, index) => (
            <li key={index}>
              <label>
                <input
                  type="checkbox"
                  checked={done}
                  onClick={() => onCheck(index)}
                />
                {done ? <s>{name}</s> : <span>{name}</span>}
              </label>
              <button onClick={() => onRemove(index)}>-</button>
            </li>
          ))}
        </ul>
        <div>
          <input
            onKeyDown={event => {
              if (event.keyCode === 13) {
                handleAdd(event.target.value);
                event.target.value = '';
              }
            }}
            placeholder="Press Enter"
          />
        </div>
      </div>
    );
  }

  ReactDOM.render(<Provider>
    <Todos />
  </Provider>, document.getElementById('root'));
  ```

## 浏览器支持

| ![Chrome](https://raw.github.com/alrra/browser-logos/master/src/chrome/chrome_48x48.png) | ![Firefox](https://raw.github.com/alrra/browser-logos/master/src/firefox/firefox_48x48.png) | ![Edge](https://raw.github.com/alrra/browser-logos/master/src/edge/edge_48x48.png) | ![IE](https://raw.github.com/alrra/browser-logos/master/src/archive/internet-explorer_9-11/internet-explorer_9-11_48x48.png) | ![Safari](https://raw.github.com/alrra/browser-logos/master/src/safari/safari_48x48.png) | ![Opera](https://raw.github.com/alrra/browser-logos/master/src/opera/opera_48x48.png) | ![UC](https://raw.github.com/alrra/browser-logos/master/src/uc/uc_48x48.png) |
| :--------------------------------------------------------------------------------------: | :-----------------------------------------------------------------------------------------: | :--------------------------------------------------------------------------------: | :--------------------------------------------------------------------------------------------------------------------------: | :--------------------------------------------------------------------------------------: | :-----------------------------------------------------------------------------------: | :--------------------------------------------------------------------------: |
|✔ |✔|✔|9+ ✔|✔|✔|✔|

## 灵感

创造 icestore 的灵感来源于 [constate](https://github.com/diegohaz/constate) 和 [rematch](https://github.com/rematch/rematch)。

## 贡献

欢迎反馈问题 [issue 链接](https://github.com/alibaba/ice/issues/new)
如果对 `icestore` 感兴趣，欢迎参考 [CONTRIBUTING.md](https://github.com/alibaba/ice/blob/master/.github/CONTRIBUTING.md) 学习如何贡献代码。

## 协议

[MIT](LICENSE)

