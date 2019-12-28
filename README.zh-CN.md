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

* **简单、熟悉的 API**：不需要额外的学习成本，只需要了解 React Hooks；
* **够用，可扩展**：满足 80% 的场景，另外 20% ？可使用中间件机制进行满足；
* **支持组件 Class 写法**：友好的兼容策略可以让老项目享受轻量状态管理的乐趣；
* **集成异步处理**：记录异步操作时的执行状态，简化视图中对于等待或错误的处理逻辑；
* **良好的 Typescript 支持**：提供完整的 Typescript 类型定义，在 VSCode 中能获得完整的类型检查和推断；
* **性能优化**：通过多 Store 的去中心化设计，减少单个 state 变化触发重新渲染的组件个数，从而减少不必要的渲染。

`icestore` 数据流示意图如下：

<img src="https://user-images.githubusercontent.com/5419233/60956252-012f9300-a335-11e9-8667-75490ceb62b1.png" width="400" />

## 快速开始

让我们使用 `icestore` 开发一个简单的 Todo 应用，包含以下几个步骤：

* 定义 Store：

  ```javascript
  // src/stores/todos.js
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
* 注册 Store：

  ```javascript
  // src/stores/index.js
  import todos from './todos';
  import Store from '@ice/store';

  const storeManager = new Store();
  const stores = storeManager.registerStores({
    todos
  });

  export default stores;
  ```

* 在 View 中，绑定 Store：

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

完整示例请参考：[CodeSandbox](https://codesandbox.io/s/icestore-ltpuo)。

> icestore 提供了完整的 Typescript 类型定义，在 VSCode 中能获得完整的类型推导的提示，示例请参考：[CodeSandbox](https://codesandbox.io/s/icestore-ts-gduqw)。

## API

### registerStores

注册多个 Store 配置到全局 icestore 实例上。

* 参数
  - stores {object} 多个 Store 的配置对象，每个 Store 配置中包含 State 和 Action

* 返回值
  - {object} stores 管理器对象，包含以下几个方法
      - useStore {function} 使用单个 Store 的 hook
          - 参数
             - namespace {string} Store 的命名空间
          - 返回值
             - {object} Store 的配置对象
      - useStores {function} 同时使用多个 Store 的 hook
          - 参数
              - namespaces {array} 多个 Store 的命名空间数组
          - 返回值
              - {object} 多个 Store 的配置对象，以 namespace 区分
      - withStore {function} 
          - 参数
              - namespace {string} Store 的命名空间
              - mapStoreToProps {function} 选填，将 store 映射到 props 的处理函数
          - 返回值
              - HOC 高阶组件
      - withStores {function} 
          - 参数
              - namespaces {array} 多个 Store 的命名空间数组
              - mapStoresToProps {function} 选填，将 stores 映射到 props 的处理函数
          - 返回值
              - HOC 高阶组件
      - getState {function} 获取单个 Store 的最新 State 对象。
          - 参数
              - namespace {string} Store 的命名空间
          - 返回值
              - {object} Store 的 State 对象

### applyMiddleware

给所有 Store 或者指定 namespace 的 Store 注册中间件：如果不指定第二个参数，则给所有 Store 注册 中间件，如果指定第二个参数，则给指定 namespace 的 Store 注册中间件，详细用法见[注册方式](#注册方式)

* 参数
  - middlewares {array} 待注册的中间件数组
  - namespace {string} Store 的命名空间
* 返回值
  - 无

## 高级用法

### 异步 Action 执行状态

`icestore` 内部集成了对于异步 Action 的异步状态记录，方便用户在不增加额外的 State 的前提下访问异步 Action 的执行状态（loading 与 error），从而使状态的渲染逻辑更简洁。

#### API

* `action.loading` - Action 是否正在执行中的标志位
  - Type: {boolean}
  - Default: false
* `action.error` - Action 执行完成后如果有错误发生返回的错误对象
  - Type: {object}
  - Default: null
* `action.disableLoading` - 是否关闭 Action loading 效果的开关, 如果设置为 true, 当 loading 标志位变化时，关联的 view 组件将不会重新渲染
  - Type: {boolean}
  - Default: false
* `store.disableLoading` - 是否全局关闭所有 Action 的 loading 效果. 注意当全局与 Action 上的该标志位均设置时，action 上标志位优先级高
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

### 在 Class 组件中使用

```tsx
import React from 'react';
import ReactDOM from 'react-dom';
import Icestore from '@ice/store';

interface Todo {
  id: number;
  name: string;
}

interface TodoStore {
  dataSource: Todo[];
  refresh: () => void;
  remove: (id: number) => void;
}

const todos: TodoStore = {
  // Action 和 State 声明...
};

const icestore = new Icestore();
const stores = icestore.registerStores({
  todos,
});

class TodoList extends Component<{store: TodoStore}> {
  onRmove = (id) => {
    const {store} = this.props;
    store.remove(id);
  }

  componentDidMount() {
    this.props.store.refresh();
  }

  render() {
    const {store} = this.props;
    return (
      <div>
        {
          store.dataSource.map(({id, name}) => {
            return (<p>
              {name}
              <button onClick={() => onRmove(id)} >删除</button>
            </p>);
          })
        }
      </div>
      
    );
  }
}

const TodoListWithStore = stores.withStore('todos')(TodoList);
ReactDOM.render(<TodoListWithStore />, document.body);
```

### 中间件

#### 背景

如果你有使用过服务端的框架如 Express 或者 koa，应该已经熟悉了中间件的概念，在这些框架中，中间件用于在框架 `接收请求` 与 `产生响应` 间插入自定义代码，这类中间件的功能包含在请求未被响应之前对数据进行加工、鉴权，以及在请求被响应之后添加响应头、打印 log 等功能。

在状态管理领域，Redux 同样实现了中间件的机制，用于在 `action 调用` 与 `到达 reducer` 之间插入自定义代码，中间件包含的功能有打印 log、提供 thunk 与 promise 异步机制、日志上报等。

icestore 支持中间件的目的与 Redux 类似，也是为了在 Action 调用前后增加一种扩展机制，增加诸如打印 log、埋点上报、异步请求封装等一系列能力，不同的是 icestore 已支持异步机制，因此不需要额外通过中间件方式支持。

#### 中间件 API

在中间件 API 的设计上，`icestore` 借鉴了 koa 的 API，见如下：

```javascript
async (ctx, next) =>  {
  // Action 调用前逻辑

  const result = await next();

  // Action 调用后逻辑

  return result;
}
```

如果用户定义的 Action 中有返回值，中间件函数必须将下一个中间件的执行结果返回，以保证中间件链式调用完成后能拿到 Action 的返回值。

##### ctx API

对于中间件函数的第一个 ctx 参数，从上面能拿到当前的 Store 与当前调用 Action 的信息，ctx 对象中包含的详细参数如下：

* ctx.action - 当前调用的 Action 对象
  * 类型：{object}
  * 默认值：无
* ctx.action.name - 当前调用的 Action 方法名
  * 类型：{string}
  * 默认值：无
* ctx.action.arguments - 当前调用的 Action 方法参数数组
  * 类型：{array}
  * 默认值：无
* ctx.store - 当前 Store 对象
  * 类型：{object}
  * 默认值：无
* ctx.store.namespace - 当前 Store 的 namespace
  * 类型：{string}
  * 默认值：无
* ctx.store.getState - 获取当前 Store 最新 state 的方法
  * 类型：{function}
  * 参数：无

调用方式如下：

```javascript
const {
  action, // 当前调用的 action 对象
  store, // 当前 store 对象
} = ctx;

const {
  name, // 当前调用的 action 方法名
  arguments, // 当前调用的 action 方法参数数组
} = action;

const { 
  namespace,  // 当前 store namespace
  getState, // 获取当前 store state 方法
} = store;
```

#### 注册方式

由于 `icestore` 的多 Store 设计，`icestore` 支持给不同的 Store 单独注册 middleware，
方式如下：

1. 全局注册 middleware  
  全局注册的 middleware 对所有 Store 生效

	```javascript
	import Icestore from '@ice/store';
	const stores = new Icestore();
	stores.applyMiddleware([a, b]);
	```
2. 指定 Store 注册 middleware  
  Store 上最终注册的 middleware 将与全局注册 middleware 做合并

	```javascript
	stores.applyMiddleware([a, b]); 
	stores.applyMiddleware([c, d], 'foo'); // store foo 中间件为 [a, b, c, d]
	stores.applyMiddleware([d, c], 'bar'); // store bar 中间件为 [a, b, d, c]
	```

## 调试

icestore 官方提供 Logger 中间件，可以方便地跟踪触发 Action 名以及 Action 触发前后 state 的 diff 信息，提升问题排查效率。

### 使用方式

在注册 Store 之前，使用 `applyMiddleware` 方法将 Logger 中间件加入到中间件队列中

```javascript
import todos from './todos';
import Icestore from '@ice/store';
import logger from '@ice/store-logger';

const icestore = new Icestore();

const middlewares = [];

// 线上环境不开启调试中间件
if (process.env.NODE_ENV !== 'production') {
  middlewares.push(logger);
}

icestore.applyMiddleware(middlewares);
icestore.registerStore('todos', todos);
```

注册成功后，当 `store` 中的 Action 被调用时，在浏览器的 DevTools 中将能看到实时的日志：

<img src="https://user-images.githubusercontent.com/5419233/63344463-13184300-c383-11e9-96da-2de3b41f6e9b.png"  width="250" />

日志中包含以下几个部分：

* Store Name: 当前子 Store 对应的 namespace
* Action Name: 当前触发的 Action 名
* Added / Deleted / Updated: State 变化的 diff
* Old State: 更新前的 State
* New State: 更新后的 State


## 测试

由于所有的 State 和 Actions 都封装在一个普通的 JavaScript 对象中，可以在不 mock 的情况下很容易的给 Store 写测试用例。

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

完整的测试用例请参考上面[sandbox](https://codesandbox.io/s/icestore-ltpuo)中的 `todos.spec.js` 文件。

## 最佳实践

### 目录结构组织

对于大多数的中小型项目，推荐将项目所有 Store 集中管理在 `src/stores/` 目录下：

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

如果项目比较庞大或者更倾向于 Store 跟随页面维护，那么可以在每个 page 目录都声明一个 Store 示例，但这种情况应尽量避免跨页面的 Store 调用。

### 不要在 Action 之外直接修改 State

`icestore` 的架构设计中强制要求对 State 的变更只能在 Action 中进行。在 Action 之外的对 State 的修改不生效。这个设计的原因是：在 Action 之外修改 State 将导致 State 变更的逻辑散落在 View 中，变更逻辑将会难以追踪和调试。

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
    // bad!!!
    todos.inited = true;

    // good
    todos.setInited();
  });
```

### 尽可能地拆分 Store

从 `icestore` 的内部设计来看，当某个 Store 的 State 发生变化时，所有使用 useStore 监听 Store 变化的 View 组件都会触发重新渲染，这意味着一个 Store 中存放的 State 越多越可能触发更多的 Store 组件重新渲染。因此从性能方面考虑，建议按照功能划分将 Store 拆分成一个个独立的个体。

### 不要滥用 `icestore`

从工程的角度来看， Store 中应该只用来存放跨页面与组件的状态。将页面或者组件中的内部状态放到 Store 中将会破坏组件自身的封装性，进而影响组件的复用性。对于组件内部状态完全可以使用 useState 来实现，因此如果上面的 Todo App 如果是作为工程中的页面或者组件存在的话，使用 useState 而不是全局 Store 来实现才是更合理的选择。

## 浏览器支持

| ![Chrome](https://raw.github.com/alrra/browser-logos/master/src/chrome/chrome_48x48.png) | ![Firefox](https://raw.github.com/alrra/browser-logos/master/src/firefox/firefox_48x48.png) | ![Edge](https://raw.github.com/alrra/browser-logos/master/src/edge/edge_48x48.png) | ![IE](https://raw.github.com/alrra/browser-logos/master/src/archive/internet-explorer_9-11/internet-explorer_9-11_48x48.png) | ![Safari](https://raw.github.com/alrra/browser-logos/master/src/safari/safari_48x48.png) | ![Opera](https://raw.github.com/alrra/browser-logos/master/src/opera/opera_48x48.png) | ![UC](https://raw.github.com/alrra/browser-logos/master/src/uc/uc_48x48.png) |
| :--------------------------------------------------------------------------------------: | :-----------------------------------------------------------------------------------------: | :--------------------------------------------------------------------------------: | :--------------------------------------------------------------------------------------------------------------------------: | :--------------------------------------------------------------------------------------: | :-----------------------------------------------------------------------------------: | :--------------------------------------------------------------------------: |
|✔ |✔|✔|9+ ✔|✔|✔|✔|

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

