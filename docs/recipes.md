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
  actions: {
    async refresh() {
      return await fetch('/user');
    },
  },
};

// src/models/tasks
import { user }  from './user';

export default {
  state: [],
  actions: {
    async refresh() {
      return await fetch('/tasks');
    },
    async add(prevState, task, actions, globalActions) {
      await fetch('/tasks/add', task);

      // Retrieve user information after adding tasks
      await globalActions.user.refresh();

      // Retrieve todos after adding tasks
      await actions.refresh();

      return { ...prevState };
    },
  }
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

## Async actions' executing status

`icestore` has built-in support to access the executing status of async actions. This enables users to have access to the isLoading and error executing status of async actions without defining extra state, making the code more consise and clean.

### Example

```js
import { useModelActions } from './store';

function FunctionComponent() {
  const actions = useModelActions('name');
  const actionsState = useModelActionsState('name');

  useEffect(() => {
    actions.fetch();
  }, []);

  actionsState.fetch.isLoading;
  actionsState.fetch.error;
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

## Comparison

- O: Yes
- X: No
- +: Tips

| | constate | zustand | react-tracked | rematch | icestore |
| --------| -------- | -------- | -------- | -------- | -------- |
| Framework | React | React | React | Any,None | React |
| Simplicity | ★★★★ | ★★★ | ★★★ | ★★★★ | ★★★★★ |
| Readability | ★★★ | ★★★ | ★★★ | ★★★ | ★★★★ |
| Configurable | ★★★ | ★★★ | ★★★ | ★★★★★ | ★★★ |
| Less boilerplate | ★★ | ★★★ | ★★★ | ★★★★ | ★★★★★ |
| Async Action | + | O | O | O | O |
| Class Component | + | + | + | O | O |
| Function Component | O | O | O | O | O |
| Async Status | X | X | X | O | O |
| Centralization | X | X | X | O | O |
| Model interaction | + | + | + | O | O |
| SSR | O | X | O | O | O |
| Lazy load models | + | + | + | O | O |
| Persist | X | X | X | O | X |
| Middleware or Plug-in | X | O | X | O | X |
| Devtools | X | O | X | O | X |
 