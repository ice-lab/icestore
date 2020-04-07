---
id: recipes
title: Recipes
---

English | [简体中文](./recipes.zh-CN.md)

## Model interaction

Model interaction is a common usage scene which can be implemented by calling actions from other model in a model's action.

### Example

Suppose you have a User Model, which records the number of tasks of the user. And a Tasks Model, which records the task list of the system. Every time a user adds a task, user's task number needs to be updated.

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

      // Retrieve user information after adding tasks
      await dispatch.user.refresh();

      // Retrieve todos after adding tasks
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

### Pay attention to circular dependencies

Please pay attention to circular dependencies problem when actions calling each other between models.

For example, the action A in Model A calls the action B in Model B and the action B in Model B calls the action A in Model A will results into an endless loop.

Be careful the possibility of endless loop problem will arise when methods from different models call each other.

## effects' executing status

`icestore` has built-in support to access the executing status of effects. This enables users to have access to the isLoading and error executing status of effects without defining extra state, making the code more consise and clean.

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

## Class Component Support

You can also using icestore with Class Component. The `withModel()` function connects a Model to a React component.

### Basic

```tsx
import { ExtractIModelFromModelConfig } from '@ice/store';
import todosModel from '@/models/todos';
import store from '@/store';

const { withModel } = store;

interface MapModelToProp {
  todos: ExtractIModelFromModelConfig<typeof todosModel>;  // `withModel` automatically adds the name of the model as the property
}

interface Props extends MapModelToProp {
  title: string; // custom property
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

### With multiple models

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

// functional flavor:
import compose from 'lodash/fp/compose';
export default compose(withModel('user'), withModel('todos'))(TodoList);
```

### withModelDispatchers & withModelEffectsState

You can use `withModelDispatchers` to call only model actions without listening for model changes, also for `withModelEffectsState`.

See [docs/api](./api.md) for more details.

## Directory organization

For most small and medium-sized projects, it is recommended to centrally manage all the project models in the global `src/models/` directory:

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

If the project is relatively large, or more likely to follow the page maintenance of the store,then you can declare a store instance in each page directory. However, in this case, cross page store calls should be avoided as much as possible.

## Immutable Description 

### Don't destructure the state argument

In order to support the mutation API we utilise [immer](https://github.com/immerjs/immer). Under the hood immer utilises Proxies in order to track our mutations, converting them into immutable updates. Therefore if you destructure the state that is provided to your action you break out of the Proxy, after which any update you perform to the state will not be applied.

Below are a couple examples of this antipattern.

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

### Switching to an immutable API

By default we use immer to provide a mutation based API.

This is completely optional, you can instead return new state from your actions like below.

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

Should you prefer this approach you can explicitly disable immer via the disableImmer option value of createStore.

```js
import { createStore } from '@ice/store';

const store = createStore(models, {
  disableImmer: true; // 👈 set the flag
});
```

## Comparison

- O: Yes
- X: No
- +: Extra

| feature | redux | constate | zustand | react-tracked | icestore |
| :--------| :--------| :-------- | :-------- | :-------- | :-------- |
| Framework | Any | React | React | React | React |
| Simplicity | ★★ | ★★★★ | ★★★ | ★★★ | ★★★★ |
| Less boilerplate | ★ | ★★ | ★★★ | ★★★ | ★★★★ |
| Configurable | ★★ | ★★★ | ★★★ | ★★★ | ★★★★★ |
| Shareable State | O | O | O | O | O |
| Reusable State | O | O | O | O | O |
| Interactive State | + | + | + | + | O |
| Class Component | O | + | + | + | O |
| Function Component | O | O | O | O | O |
| Async Status | + | X | X | X | O |
| SSR | O | O | X | O | O |
| Persist | + | X | X | X | O |
| Lazy load models | + | + | + | + | O |
| Centralization | O | X | X | X | O |
| Middleware or Plug-in | O | X | O | X | O |
| Devtools | O | X | O | X | O |
