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

```bash
$ npm install @ice/store --save
```

## 简介

`icestore` 是基于 React Hooks 实现的轻量级状态管理框架，有以下核心特点：

* **极简 API**：只有 3 个 API，简单上手，使用方便，不需要学习 Redux 里的各种概念。
* **React Hooks**：拥抱 Hooks 的使用体验，同时也是基于 React Hooks 实现。
* **集成异步状态**：记录异步 action 的执行状态，简化 view 组件中对于 loading 与 error 状态的渲染逻辑。
* **性能优化**：通过多 store 的去中心化设计，减少单个 state 变化触发重新渲染的组件个数，同时改变 state 时做 diff，进一步减少不必要的渲染。
* **单向数据流**：与 Redux 一样使用单向数据流，便于状态的追踪与预测。

### 兼容性

`icestore` 由于依赖了 React@16.8.0+ 提供的 Hooks 特性，因此只支持 React 16.8.0 及以上版本。

## 快速开始

让我们使用 `icestore` 开发一个简单的 todo 应用，包含以下几个步骤：

* 定义 store：

```javascript
// src/stores/todos.js，不同 store 对应不同的 js 文件
export default {
  dataSource: [],
  async fetchData() {
    // 模拟异步请求
    const data = await new Promise(resolve =>
      setTimeout(() => {
        resolve([
          { name: 'react' },
          { name: 'vue', done: true},
          { name: 'angular' },
        ]);
      }, 1000)
    );
    this.dataSource = data;
  },

  add(todo) {
    this.dataSource.push(todo);
  },
};
```

* 注册 store：

```javascript
// src/stores/index.js，所有的 store 都在这里注册
import todos from './todos';
import Store from '@ice/store';

const storeManager = new Store();
storeManager.registerStore('todos', todos);

export default storeManager;
```

* 在 view 组件中，绑定 store：

```javascript
// src/index.js
import React, { useEffect } from 'react';
import ReactDOM from 'react-dom';
import stores from './stores';

function Todo() {
  const todos = stores.useStore('todos');
  const { dataSource, fetchData, add, } = todos;

  useEffect(() => {
    fetchData();
  }, []);

  function handleAdd(name) {
    add({ name });
  }

  if (fetchData.loading) {
    return <span>loading...</span>;
  } else {
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
    )
  }
}

ReactDOM.render(<Todo />, document.getElementById('root'));
```

完整示例展示在这个 [sandbox](https://codesandbox.io/s/icestore-hs9fe)。


## Todos

- [ ] 增加调试工具
- [ ] 支持 middleware

## 实现原理

`icestore` 数据流示意图如下：

<img src="https://user-images.githubusercontent.com/5419233/60956252-012f9300-a335-11e9-8667-75490ceb62b1.png" width="400" />

## 最佳实践

### 目录结构组织

对于大多数的中小型项目，推荐将项目所有 store 集中管理在 `src/stores/` 目录下：

```bash
├── src/
│   ├── components/
│   │   └── NotFound/
│   ├── pages/
│   │   └── Home
│   ├── stores/
│   │   ├── storeA.js
│   │   ├── storeB.js
│   │   ├── storeC.js
│   │   └── index.js
```

如果项目比较庞大或者更倾向于 store 跟随页面维护，那么可以在每个 page 目录都声明一个 store 示例，但是这种情况建立尽量避免跨页面的 store 调用。

### 不要在 action 之外直接修改 state

`icestore` 的架构设计中强制要求对state的变更只能在 action 中进行。在 action 之外的对 state的修改将直接 throw 错误。这个设计的原因是在 action 之外修改 state 将导致 state 变更逻辑散落在 view 中，变更逻辑将会难以追踪和调试。

```javascript
  // store.js
  export default {
    inited: false,
    setInited() {
      this.inited = true;
    }
  }

  // view.js
  const todos = useStore('todos');

  useEffect(() => {
    // bad
    todos.inited = true;

    // good
    todos.setInited();
  });
```

### 尽可能小的拆分 store

从 `icestore` 的内部设计来看，当某个 store 的 state 发生变化时，所有使用 useStore 监听 store 变化的 view 组件都会触发重新渲染，这意味着一个 store 中存放的 state 越多越可能触发更多的 view 组件重新渲染。因此从性能方面考虑，建议按照功能划分将 store 拆分成一个个独立的个体。

### 不要滥用 `icestore`

从工程的角度来看，store 中应该只用来存放跨页面与组件的状态。将页面或者组件中的内部状态放到 store 中将会破坏组件自身的封装性，进而影响组件的复用性。对于组件内部状态完全可以使用 useState 来实现，因此如果上面的 todo app 如果是作为工程中的页面或者组件存在的话，使用 useState 而不是全局 store 来实现才是更合理的。

## API

### registerStore

将 store 配置注释到全局 store 实例。

* 参数
  - namespace {string} store 的命名空间
  - bindings {object} store 配置，包含 state 和 actions
* 返回值
  - {object} store 实例

### useStores

同时使用多个 store 的 hook。

* 参数
  - namespaces {array} 多个 store 的命名空间数组
* 返回值
  - {array} 多个 store 的配置对象数组

### useStore

使用单个 store 的 hook。

* 参数
  - namespace {string} store 的命名空间
* 返回值
  - {object} store 的配置对象

### toJS

递归将 Proxy 化的 state 对象转化成普通的 javaScript 对象

* 参数
  - value {any} 任意 javaScript 类型值
* 返回值
  - {any} 去 Proxy 后的 javaScript 类型

#### 示例

```javascript
// store.js
export default {
  value: {
    a: 1,
    b: 2,
  }
};

// view.jsx
import IceStore, { toJS } from '@ice/store';
const { value } = useStore('foo');

const a = toJS(value);
console.log(a);

```

## 高级用法

### 异步 action 执行状态

`icestore` 内部集成了对于异步 action 的异步状态记录，方便用户在不增加额外的 state 的前提下访问异步 action 的执行状态（loading 与 error），从而使状态的渲染逻辑更简洁。

#### API

* `action.loading` - action 是否正在执行中的标志位
  - Type: {boolean}
  - Default: false
* `action.error` - action 执行完成后如果有错误发生返回的错误对象
  - Type: {object}
  - Default: null
* `action.disableLoading` - 是否关闭 action loading 效果的开关, 如果设置为 true, 当 loading 标志位变化时，关联的 view 组件将不会重新渲染
  - Type: {boolean}
  - Default: false
* `store.disableLoading` - 是否全局关闭所有 action 的 loading 效果. 注意当全局与 action 上的该标志位均设置时，action 上标志位优先级高
  - Type: {boolean}
  - Default: false


#### 示例

```javascript
const todos = store.useStore('todos');
const { refresh, dataSource } = todos;

useEffect(() => {
  refresh();
}, []);

const loadingView = (
  <div>
    loading.......
  </div>
);

const taskView = !refresh.error ? (
  <ul>
   {dataSource.map(({ name }) => (
     <li>{name}</li>
   ))}
  </ul>
) : (
  <div>
    {refresh.error.message}
  </div>
);


return (
  <div>
    {!refresh.loading ? taskView : loadingView}
  <Loading />
);
```

## 测试

由于所有的 state 和 actions 都封装在一个普通的 JavaScript 对象中，可以在不 mock 的情况下很容易的给 store 写测试用例。

#### 示例

```javascript
describe('todos', () => {
  test('refresh data success', async () => {
    await todos.refresh();
    expect(todos.dataSource).toEqual([
      {
        name: 'react'
      },
      {
        name: 'vue',
        done: true
      },
      {
        name: 'angular'
      }
    ]);
  });
});
```

完整的测试用例请参考上面[sandbox](https://codesandbox.io/s/icestore-hs9fe)中的 `todos.spec.js` 文件。

## Reference

- [react-hooks-model](https://github.com/yisbug/react-hooks-model)
- [redux-react-hook](https://github.com/facebookincubator/redux-react-hook)
- [redux](https://github.com/reduxjs/redux)
- [mobx](https://github.com/mobxjs/mobx)

## Contributors

欢迎反馈问题 [issue 链接](https://github.com/alibaba/ice/issues/new)
如果对 `icestore` 感兴趣，欢迎参考 [CONTRIBUTING.md](https://github.com/alibaba/ice/blob/master/.github/CONTRIBUTING.md) 学习如何贡献代码。

## License

[MIT](LICENSE)

