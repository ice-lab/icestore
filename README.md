# Icestore

> 基于 React Hooks 的数据流方案。

[![NPM version](https://img.shields.io/npm/v/icestore.svg?style=flat)](https://npmjs.org/package/icestore)
[![Package Quality](https://npm.packagequality.com/shield/icestore.svg)](https://packagequality.com/#?package=icestore)
[![build status](https://img.shields.io/travis/ice-lab/icestore.svg?style=flat-square)](https://travis-ci.org/ice-lab/icestore)
[![Test coverage](https://img.shields.io/codecov/c/github/ice-lab/icestore.svg?style=flat-square)](https://codecov.io/gh/ice-lab/icestore)
[![NPM downloads](http://img.shields.io/npm/dm/icestore.svg?style=flat)](https://npmjs.org/package/icestore)
[![Known Vulnerabilities](https://snyk.io/test/npm/icestore/badge.svg)](https://snyk.io/test/npm/icestore)
[![David deps](https://img.shields.io/david/ice-lab/icestore.svg?style=flat-square)](https://david-dm.org/ice-lab/icestore)

## 安装

```bash
npm install icestore --save
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
import Icestore from 'icestore';

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

