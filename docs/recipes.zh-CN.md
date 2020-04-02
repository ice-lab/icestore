---
id: recipes
title: Recipes
---

[English](./recipes.md) | 简体中文

## 模型联动

模型联动是一个非常常见的场景，可以实现在一个模型中触发另一个模型状态的变更。

### 示例

您有一个用户模型，记录了用户拥有多少个任务；还有一个任务模型，记录了任务的列表详情。每当添加任务时，都需要更新用户拥有的任务数。

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
      this.update(data);
    },
  }),
};

// src/models/tasks
export default {
  state: [],
  effects: (dispatch) => ({
    async refresh() {
      const data = await fetch('/tasks');
      this.update(data);
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

如果是多个模型间相互调用，死循环问题的出现概率就会提升。

## 模型副作用的执行状态

icestore 内部集成了对于异步副作用的状态记录，方便您在不增加额外的状态的前提下访问异步副作用的执行状态（loading 与 error），从而使状态的渲染的处理逻辑更加简洁。

### Example

```js
import { useModelDispatchers } from './store';

function FunctionComponent() {
  const dispatchers = useModelDispatchers('name');
  const effectsState = useModelEffectsState('name');

  useEffect(() => {
    dispatchers.fetch();
  }, []);

  effectsState.fetch.isLoading;
  effectsState.fetch.error;
}
```

## 在 Class 组件中使用模型

您可以在 Class 组件中使用模型，只需要调用 `withModel()` 方法将模型绑定到 React 组件中。

### Basic

```tsx
import { ExtractIModelFromModelConfig } from '@ice/store';
import todosModel from '@/models/todos';
import store from '@/store';

const { withModel } = store;

interface MapModelToProp {
  todos: ExtractIModelFromModelConfig<typeof todosModel>;  // `withModel` 自动添加的 props 字段用于访问模型
}

interface Props extends MapModelToProp {
  title: string; // 自定义 props
}

class TodoList extends Component<Props> {
  render() {
    const { title, todos } = this.props;
    const [ state, dispatchers ] = todos;
    
    state.field; // get state
    dispatchers.add({ /* ... */}); // run action
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

// 函数式编程的方式：
import compose from 'lodash/fp/compose';
export default compose(withModel('user'), withModel('todos'))(TodoList);
```

### withModelDispatchers & withModelEffectsState

您可以使用 `withModelDispatchers` 用于使用模型的调度器而不订阅模型的更新，`withModelEffectsState` 的 API 签名与前者一致。

查看 [docs/api](./api.zh-CN.md) 了解使用方式。

## 项目的目录组织

对于大多数中小型项目，建议集中管理模型，在 “src/models/” 目录中存放项目的所有模型：

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

## 不可变数据

### 不要解构参数

我们使用 [immer](https://github.com/immerjs/immer) 来实现不可变数据的操作 API。immer 使用代理（Proxy）来跟踪我们的变化，将它们转换为新的更新。因此，如果对提供用于操作的状态进行解构，则会脱离代理，在此之后，将不会检测到它的任何更新。

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

默认情况下，我们使用 immer 提供一个基于变更跟踪的 API。

这是完全可选的，您可以像下面这样操作，返回新的状态。

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

如果您喜欢这种方式，可以通过 createStore 的 disableImmer 选项禁用 immer。

```js
import { createStore } from '@ice/store';

const store = createStore(models, {
  disableImmer: true; // 👈 通过该配置禁用 immer
});
```

## Comparison

- O: Yes
- X: No
- +: Extra

| feature | constate | zustand | react-tracked | icestore |
| :--------| :-------- | :-------- | :-------- | :-------- |
| Framework | React | React | React | React |
| Simplicity | ★★★★ | ★★★ | ★★★ | ★★★★ |
| Less boilerplate | ★★ | ★★★ | ★★★ | ★★★★ |
| Configurable | ★★★ | ★★★ | ★★★ | ★★★★★ |
| Shareable State | O | O | O | O |
| Reusable State | O | O | O | O |
| Interactive State | + | + | + | O |
| Class Component | + | + | + | O |
| Function Component | O | O | O | O |
| Async Status | X | X | X | O |
| SSR | O | X | O | O |
| Persist | X | X | X | O |
| Lazy load models | + | + | + | O |
| Centralization | X | X | X | O |
| Middleware or Plug-in | X | O | X | O |
| Devtools | X | O | X | O |
