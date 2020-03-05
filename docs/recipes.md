---
id: recipes
title: Recipes
---

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
  effects: {
    async refresh(state, payload, actions) {
      const data = await fetch('/user');
      actions.update(data);
    },
  },
  reducers: {
    update(prevState, payload) {
      return { ...prevState, ...payload };
    },
  },
};

// src/models/tasks
export default {
  state: [],
  effects: {
    async refresh(state, payload, actions) {
      const data = await fetch('/tasks');
      actions.update(data);
    },
    async add(prevState, task, actions, globalActions) {
      await fetch('/tasks/add', task);

      // Retrieve user information after adding tasks
      await globalActions.user.refresh();

      // Retrieve todos after adding tasks
      await actions.refresh();
    },
  },
  reducers: {
    update(prevState, payload) {
      return { ...prevState, ...payload };
    },
  },
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
import { useModelActions } from './store';

function FunctionComponent() {
  const actions = useModelActions('name');
  const effectsState = useModelEffectsState('name');

  useEffect(() => {
    actions.fetch();
  }, []);

  effectsState.fetch.isLoading;
  effectsState.fetch.error;
}
```

## Class Component Support

You can also using icestore with Class Component. The `withModel()` function connects a Model to a React component.

### Basic

```tsx
import { UseModelValue } from '@ice/store';
import todosModel from '@/models/todos';
import store from '@/store';

const { withModel } = store;

interface MapModelToProp {
  todos: UseModelValue<typeof todosModel>;  // `withModel` automatically adds the name of the model as the property
}

interface Props extends MapModelToProp {
  title: string; // custom property
}

class TodoList extends Component<Props> {
  render() {
    const { title, todos } = this.props;
    const [ state, actions ] = todos;
    
    state.field; // get state
    actions.add({ /* ... */}); // run action
  }
}

export default withModel('todos')<MapModelToProp, Props>(TodoList);
```

### With multiple models

```tsx
import { UseModelValue } from '@ice/store';
import todosModel from '@/models/todos';
import userModel from '@/models/user';
import store from '@/store';

const { withModel } = store;

interface Props {
  todos: UseModelValue<typeof todosModel>;
  user: UseModelValue<typeof userModel>;
}

class TodoList extends Component<Props> {
  render() {
    const { todos, user } = this.props;
    const [ todoState, todoActions ] = todos;
    const [ userState, userActions ] = user;
  }
}

export default withModel('user')(
  withModel('todos')(TodoList)
);

// functional flavor:
import compose from 'lodash/fp/compose';
export default compose(withModel('user'), withModel('todos'))(TodoList);
```

### withModelActions & withModelActionsState

You can use `withModelActions` to call only model actions without listening for model changes, also for `withModelActionsState`.

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

## Upgrade Guidelines

### Define Model

#### 0.x

```ts
import user from './user';

const store = {
  dataSource: [],
  async refresh() {
    await delay(2000);

    this.dataSource = [
      {
        name: 'react',
      },
      {
        name: 'vue',
        done: true,
      },
      {
        name: 'angular',
      },
    ],
    user.setTodos(this.dataSource.length);
  },
  add(todo) {
    this.dataSource.push(todo);
    user.setTodos(this.dataSource.length);
  },
};
```

#### 1.x

```ts
const todos = {
  state: {
    dataSource: [],
  },
  reducers: {
    update(prevState, payload) {
      return {
        ...prevState,
        ...payload,
      };
    },
  },
  effects: {
    add(state, todo, actions, globalActions) {
      const dataSource = [].concat(state.dataSource);
      dataSource.push(todo);
      globalActions.user.setTodos(dataSource.length);
      actions.update({
        dataSource,
      });
    },
    async refresh(state, payload, actions, globalActions) {
      await delay(2000);

      const dataSource = [
        {
          name: 'react',
        },
        {
          name: 'vue',
          done: true,
        },
        {
          name: 'angular',
        },
      ];
      globalActions.user.setTodos(dataSource.length);
      actions.update({
        dataSource,
      });
    },
  },
};
```

### Create store

#### 0.x

```js
import Icestore from '@ice/store';
import * as stores from './stores';

const icestore = new Icestore();
export default icestore.registerStores(stores);
```

#### 1.x

```js
import { createStore } from '@ice/store';
import * as models from './models';

export default createStore(models);
```

### Consume model

#### 0.x

```js
function App() {
  const todos = stores.useStore('todos');
  const { dataSource, add } = todos;
}
```

#### 1.x

```js
function App() {
  const [ state, actions ] = store.useModel('todos');
  const { dataSource } = state;
  const { add } = actions;
}
```

### Binding View

#### 0.x

No need.

#### 1.x

```js
const { Provider } = store;
ReactDOM.render(<Provider>
  <App />
</Provider>, document.getElementById('root'));
```

## Comparison

- O: Yes
- X: No
- +: Extra

| | constate | zustand | react-tracked | rematch | icestore |
| --------| -------- | -------- | -------- | -------- | -------- |
| Framework | React | React | React | Any,None | React |
| Simplicity | ★★★★ | ★★★ | ★★★ | ★★★★ | ★★★★★ |
| Less boilerplate | ★★ | ★★★ | ★★★ | ★★★★ | ★★★★★ |
| Configurable | ★★★ | ★★★ | ★★★ | ★★★★★ | ★★★ |
| Shareable State | O | O | O | O | O |
| Reusable State | O | O | O | O | O |
| Interactive State | + | + | + | O | O |
| Class Component | + | + | + | O | O |
| Function Component | O | O | O | O | O |
| Async Status | X | X | X | O | O |
| SSR | O | X | O | O | O |
| Persist | X | X | X | O | X |
| Lazy load models | + | + | + | O | O |
| Centralization | X | X | X | O | O | 
| Middleware or Plug-in | X | O | X | O | X |
| Devtools | X | O | X | O | X |
