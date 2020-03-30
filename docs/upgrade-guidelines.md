---
id: upgrade-guidelines
title: Upgrade Guidelines
---

## 0.x to 1.x

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
      return { ...prevState, ...payload };
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
