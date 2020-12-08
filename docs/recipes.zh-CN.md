---
id: recipes
title: 更多技巧
---

[English](./recipes.md) | 简体中文

## 模型联动

模型联动是一个非常常见的场景，可以实现在一个模型中触发另一个模型状态的变更。

### 示例

您有一个用户模型，记录了用户拥有多少个任务；还有一个任务模型，记录了任务的列表详情。每当添加任务到列表时，都需要更新用户拥有的任务数。

```tsx
// src/models/user
export default {
  state: {
    name: '',
    tasks: 0,
  },
  effects: () => ({
    async refresh() {
      const data = await fetch('/user');
      this.setState(data);
    },
  }),
};

// src/models/tasks
export default {
  state: [],
  effects: (dispatch) => ({
    async refresh() {
      const data = await fetch('/tasks');
      this.setState(data);
    },
    async add(task) {
      await fetch('/tasks/add', task);

      // 调度用户模型从服务端获取最新数据
      await dispatch.user.refresh();

      // 调度任务模型从服务端获取最新数据
      await this.refresh();
    },
  }),
};

// src/store
import { createStore } from '@ice/store';
import task from './model/task';
import user from './model/user';

export default createStore({
  task,
  user,
});
```

### 注意循环调用问题

模型间允许相互调用，需注意循环调用的问题。例如，模型 A 中的 a 方法调用了 模型 B 中的 b 方法，模型 B 中的 b 方法又调用模型 A 中的 a 方法，就会形成死循环。

如果是多个模型间进行相互调用，死循环问题的出现概率就会提升。


## 只调用方法而不订阅更新

在某些场景下，您可能只希望调用模型方法来更新状态而不订阅模型状态的更新。 例如「快速开始」示例中的 Button 组件，您没有在组件中消费模型的状态，因此可能不期望模型状态的变化触发组件的重新渲染。 这时候您可以使用 useModelDispatchers API，看下面的示例比较：

```js
import store from '@/store';

const { useModelDispatchers } = store;
function Button() {
  const [, dispatchers ] = useModel('counter'); // 这里会订阅模型状态的更新
  const { increment } = dispatchers;
  return (
    <button type="button" onClick={increment}> + </button>
  );
} 

function Button() {
  const { increment } = useModelDispatchers('counter'); // 这里不会订阅模型状态的更新
  return (
    <button type="button" onClick={increment}> + </button>
  );
}
```

## 获取模型最新状态

在某些场景下，您可能需要获取到模型的最新状态。

### 在组件中

```js
import store from '@/store';

function Logger({ foo }) {	
  // case 1 只使用状态而不订阅更新（性能优化的手段）
  function doSomeThing() {	
    const counter = store.getModelState('counter');	
    alert(counter);
  };


  // case 2 在闭包中获取最新状态
  const doOhterThing = useCallback(
    (payload) => {
      const counter = store.getModelState('counter');	
      alert(counter + foo);
    },
    [foo]
  );
  
  return (
    <div>
      <button onClick={doSomeThing}>click 1<button>
      <button onClick={doOhterThing}>click 2<button>
    </div>
  );
} 
```

### 在模型中

```js
import store from '@/store';

const user = {
  effects: dispatch => ({
    async asyncAdd(payload, state) {
      dispatch.todos.addTodo(payload); // 调用其他模型的方法更新其状态
      const todos = store.getModelState('todos'); // 获取更新后的模型最新状态
    }
  })
}
```

## 模型副作用的执行状态

icestore 内部集成了对于异步副作用的状态记录，方便您在不增加额外的状态的前提下访问异步副作用的执行状态（loading 与 error），从而使状态渲染的处理逻辑更加简洁。

### 示例

```js
import { useModelDispatchers } from './store';

function FunctionComponent() {
  const dispatchers = useModelDispatchers('name');
  const effectsState = useModelEffectsState('name');

  useEffect(() => {
    dispatchers.fetch();
  }, []);

  effectsState.fetch.isLoading; // 是否在调用中
  effectsState.fetch.error; // 调用结果是否有错误
}
```

## 在 Class 组件中使用模型

您可以在 Class 组件中使用模型，只需要调用 `withModel()` 方法将模型绑定到 React 组件中。

### 基础示例

```tsx
import { ExtractIModelFromModelConfig } from '@ice/store';
import todosModel from '@/models/todos';
import store from '@/store';

const { withModel } = store;

interface MapModelToProp {
  todos: ExtractIModelFromModelConfig<typeof todosModel>;  // `withModel` 自动添加的 props 字段用于访问模型
}

interface Props extends MapModelToProp {
  title: string; // 自定义的 props
}

class TodoList extends Component<Props> {
  render() {
    const { title, todos } = this.props;
    const [ state, dispatchers ] = todos;
    
    state.field; // 获取状态
    dispatchers.add({ /* ... */}); // 调度模型的变更操作
  }
}

export default withModel('todos')<MapModelToProp, Props>(TodoList);
```

### 使用多个模型

```tsx
import { ExtractIModelFromModelConfig } from '@ice/store';
import todosModel from '@/models/todos';
import userModel from '@/models/user';
import store from '@/store';

const { withModel } = store;

interface Props {
  todos: ExtractIModelFromModelConfig<typeof todosModel>;
  user: ExtractIModelFromModelConfig<typeof userModel>;
}

class TodoList extends Component<Props> {
  render() {
    const { todos, user } = this.props;
    const [ todoState, todoDispatchers ] = todos;
    const [ userState, userDispatchers ] = user;
  }
}

export default withModel('user')(
  withModel('todos')(TodoList)
);

// 可以通过组合的方式进行函数调用：
import compose from 'lodash/fp/compose';
export default compose(withModel('user'), withModel('todos'))(TodoList);
```

### withModelDispatchers & withModelEffectsState

您可以使用 `withModelDispatchers` 用于使用模型的调度器而不订阅模型的更新，`withModelEffectsState` 的 API 签名与前者一致。

查看 [docs/api](./api.zh-CN.md) 了解其使用方式。

## 可变状态的说明

icestore 默认为 reducer 提供了状态可变的操作方式。

### 不要解构参数

icestore 内部使用 [immer](https://github.com/immerjs/immer) 来实现可变状态的操作 API。immer 使用代理（Proxy）来跟踪我们的变化，然后将它们转换为新的更新。因此，如果对提供的状态进行解构，则会脱离代理，在此之后，将不会检测到它的任何更新。

下面是几个错误的示范：

```js
const model = {
  reducers: {
    addTodo({ items }, payload) {
      items.push(payload);
    },

    // or 

    addTodo(state, payload) => {
      const { items } = state;
      items.push(payload);
    }
  }
}
```

### 直接更新状态

默认情况下，我们使用 immer 提供可变状态的操作。但这是完全可选的，您可以像下面这样操作，返回新的状态。

```js
const model = {
  state: [],
  reducers: {
    addTodo((prevState, payload) {
      // 👇 new immutable state returned
      return [...prevState, payload];
    })
  }
}
```

如果您喜欢这种方式，可以通过 createStore 的 disableImmer 选项来禁用 immer。

```js
import { createStore } from '@ice/store';

const store = createStore(models, {
  disableImmer: true; // 👈 通过该配置禁用 immer
});
```

## 项目的目录组织

对于大多数中小型项目，建议集中管理模型，例如在 “src/models/” 目录中存放项目的所有模型：

```bash
├── src/
│   ├── components/
│   │   └── NotFound/
│   ├── pages/
│   │   └── Home
│   ├── models/
│   │   ├── modelA.js
│   │   ├── modelB.js
│   │   ├── modelC.js
│   │   └── index.js
│   └── store.js
```

如果项目相对较大，可以按照页面来管理模型。但是，在这种情况下，应该避免跨页面使用模型。

## Devtools

icestore 默认支持 [Redux Devtools](https://github.com/zalmoxisus/redux-devtools-extension)，不需要额外的配置。

![Redux Devtools](https://img.alicdn.com/tfs/TB16vJ24uL2gK0jSZFmXXc7iXXa-2880-1754.png)

可以通过额外的参数添加 Redux Devtools 的[配置选项](https://github.com/zalmoxisus/redux-devtools-extension/blob/master/docs/API/Arguments.md)。

```js
import { createStore } from '@ice/store';

const models = { counter: {} };
createStore(
  models,
  {
    redux: {
      devtoolOptions: options,
    },
  }
);
```

## 能力对比表

- O: 支持
- X: 不支持
- +: 需要额外地进行能力扩展

| 功能/库 | redux | constate | zustand | react-tracked | icestore |
| :--------| :--------| :-------- | :-------- | :-------- | :-------- |
| 框架 | Any | React | React | React | React |
| 简单性 | ★★ | ★★★★ | ★★★ | ★★★ | ★★★★ |
| 更少的模板代码 | ★ | ★★ | ★★★ | ★★★ | ★★★★ |
| 可配置性 | ★★ | ★★★ | ★★★ | ★★★ | ★★★★★ |
| 共享状态 | O | O | O | O | O |
| 复用状态 | O | O | O | O | O |
| 状态联动 | + | + | + | + | O |
| Class 组件支持 | O | + | + | + | O |
| Function 组件支持 | O | O | O | O | O |
| 异步更新的状态 | + | X | X | X | O |
| SSR | O | O | X | O | O |
| 持久化 | + | X | X | X | + |
| 懒加载模型 | + | + | + | + | O |
| 中心化 | + | X | X | X | O |
| 中间件或插件机制 | O | X | O | X | O |
| 开发者工具 | O | X | O | X | O |
