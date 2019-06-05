# Icestore

> 基于 React Hooks 的数据流方案。

[![NPM version](https://img.shields.io/npm/v/@ice/store.svg?style=flat)](https://npmjs.org/package/@ice/store)
[![Package Quality](https://npm.packagequality.com/shield/@ice%2Fstore.svg)](https://packagequality.com/#?package=@ice/store)
[![build status](https://img.shields.io/travis/ice-lab/icestore.svg?style=flat-square)](https://travis-ci.org/ice-lab/icestore)
[![Test coverage](https://img.shields.io/codecov/c/github/ice-lab/icestore.svg?style=flat-square)](https://codecov.io/gh/ice-lab/icestore)
[![NPM downloads](http://img.shields.io/npm/dm/@ice/store.svg?style=flat)](https://npmjs.org/package/@ice/store)
[![Known Vulnerabilities](https://snyk.io/test/npm/@ice/store/badge.svg)](https://snyk.io/test/npm/@ice/store)
[![David deps](https://img.shields.io/david/ice-lab/icestore.svg?style=flat-square)](https://david-dm.org/ice-lab/icestore)

## 安装

```bash
npm install @ice/store --save
```

## 快速上手

声明 Store：

```javascript
// src/stores/todos.js
export default {
  dataSource: [],
  async refresh() {
    this.dataSource = await (await fetch(/* api */)).json();
  },
  async action() {
    // ...
  },
  actionSync() {
    // ...
  },
};
```

注册 Store：

```javascript
// src/stores/index.js
import todos from './todos';
import Icestore from '@ice/store';

const icestore = new Icestore();
icestore.registerStore('todos', todos);

export default icestore;
```

在 View 中使用：

```javascript
// src/index.js
import React, { useEffect } from 'react';
import ReactDOM from 'react-dom';
import stores from './stores';

function Todo() {
  const todos = stores.useStore('todos');
  const { dataSource } = todos;

  useEffect(() => {
    todos.refresh();
  }, []);

  return (
    <div>
      <h2>Todo</h2>
      <ul>
        {dataSource.map(({ name }) => (
          <li>{name}</li>
        ))}
      </ul>
    </div>
  );
};

ReactDOM.render(
  <Todo />,
  document.body
);
```

## 示例

- Todos：[Sandbox](https://codesandbox.io/s/2017600okp)

## 参考

- [react-hooks-model](https://github.com/yisbug/react-hooks-model)
- [redux-react-hook](https://github.com/facebookincubator/redux-react-hook)
- [mobx](https://github.com/mobxjs/mobx)

