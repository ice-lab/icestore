---
id: migration
title: Migration
---

English | [简体中文](./migration.zh-CN.md)

## Migrating From Redux

We provide a gradual solution to allow your project to be partially migrated from Redux to icestore.

> Requires React 16.8.0 or later & React-Redux 7.0.0 or later.

### Step 1: Migrating createStore

See: [CodeSandbox](https://codesandbox.io/s/github/ice-lab/icestore/tree/master/examples/migration-redux-1?module=/src/index.js)

#### Redux createStore

```js
import { createStore, combineReducers } from 'redux';

import sharks from './reducers/sharks';
import dolphins from './reducers/dolphins';

const rootReducer = combineReducers({
  sharks,
  dolphins
});
const store = createStore(rootReducer);
```

#### icestore createStore

```js
import { createStore } from 'icestore';

import sharks from './reducers/sharks';
import dolphins from './reducers/dolphins';

// Using createStore from icestore
const store = createStore(
  { /* No models */ },
  {
    redux: {
      reducers: {
        sharks,
        dolphins
      }
    }
  }
);
```

### Step 2: Mix reducers & models

You can locally and incrementally replace the Redux Reducer in your project with icestore Model.

See: [CodeSandbox](https://codesandbox.io/s/github/ice-lab/icestore/tree/master/examples/migration-redux-2?module=/src/index.js)

#### Declaration

##### Redux's Reducer

```js
const INCREMENT = 'sharks/increment';

export const incrementSharks = (payload) => ({
  type: INCREMENT,
  payload,
});

export default (state = 0, action) => {
  switch(action.type) {
    case INCREMENT:
      return state + action.payload;
    default:
      return state;
  }
};
```

##### icestore's Model

```js
export default {
  state: 0,
  reducers: {
    increment: (state, payload) => state + payload
  }
}
```

#### Consumer

##### Redux in mapDispatch

```js
import { connect } from 'react-redux';
import { incrementSharks } from './reducers/sharks';
import { incrementDolphins } from './reducers/dolphins';

const mapDispatch = dispatch => ({
  incrementSharks: () => dispatch(incrementSharks(1)),
  incrementDolphins: () => dispatch(incrementDolphins(1))
});

export default connect(undefined, mapDispatch)(ReactComponent);
```

##### icestore in mapDispatch

```js
import { connect } from 'react-redux';
import { incrementDolphins } from './reducers/dolphins';

const mapDispatch = dispatch => ({
  // important!!!
  incrementSharks: () => dispatch.sharks.increment(1),
  incrementDolphins: () => dispatch(incrementDolphins(1)),
});

export default connect(undefined, mapDispatch)(ReactComponent);
```

### Step 3: Migrating Provider

See: [CodeSandbox](https://codesandbox.io/s/github/ice-lab/icestore/tree/master/examples/migration-redux-3?module=/src/index.js)

#### Migrating from react-redux Provider

##### react-redux

```js
import { Provider } from 'react-redux';
import App from './App';
import store from './store';

const Root = () => (
  <Provider store={store}>
    <App />
  </Provider>
);
```

##### icestore

```js
import App from './App';
import store from './store';

const Root = () => (
  <store.Provider>
    <App />
  </store.Provider>
);
```

#### react-redux Hooks compatible

##### Origin

```js
import { useSelector, useDispatch } from 'react-redux';

export default function() {
  const sharks = useSelector(state => state.sharks);
  const dispatch = useDispatch();
  dispatch.sharks.increment();
}
```

##### Now

```js
import { createSelectorHook, createDispatchHook } from 'react-redux';
import store from './store';

// Create Redux hooks using the context provided by the store
const useSelector = createSelectorHook(store.context);
const useDispatch = createDispatchHook(store.context);

export default function() {
  const sharks = useSelector(state => state.sharks);
  const dispatch = useDispatch();
  dispatch.sharks.increment();
}
```

#### react-redux connect compatible

##### Origin

```js
import { connect } from 'react-redux';

export default connect(
  mapState,
  mapDispatch
)(ReactComponent);
```

##### Now

```js
import { connect } from 'react-redux';
import store from './store';

export default connect(
  mapState,
  mapDispatch,
  mergeProps,

  // Pass the context provided by the store to the connect function
  { context: store.context }
)(ReactComponent);
```

### Step 4: Migrating From react-redux 

You can locally and incrementally replace the react Redux API in your project with the icestore API.

See: [CodeSandbox](https://codesandbox.io/s/github/ice-lab/icestore/tree/master/examples/migration-redux-4?module=/src/index.js)

#### Migrating From react-redux Hooks

```js
import { useSelector, useDispatch } from './reudx';
import store from './store';

function Component (){
  // const sharks = useSelector(state => state.sharks);
  const sharks = store.useModelState('sharks');
  // const dispatch = useDispatch();
  // dispatch.sharks.increment();
  const dispatchers = store.useModelDispathers('sharks');
  dispatchers.increment();
}
```

#### Migrating From react-redux connect

##### Origin

```js
import { connect } from 'react-reudx';

function Count(props) {
  console.log(props.dolphins);
  props.incrementDolphins();
}

const mapState = state => ({
  dolphins: state.dolphins
});

const mapDispatch = dispatch => ({
  incrementDolphins: dispatch.dolphins.increment
});

export default connect(
  mapState,
  mapDispatch,
  undefined,
  { context: store.context }
)(Count);
```

##### Now

```js
import store from './store';
const { withModel } = store;

function Count(props) {
  const [dolphins, { increment }] = props.dolphins;
  console.log(dolphins);
  increment();
}

withModel('dolphins')(Count);
```
