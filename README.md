# Icestore

> 基于 React Hooks 的数据流方案。

[![NPM version](https://img.shields.io/npm/v/icestore.svg?style=flat)](https://npmjs.org/package/icestore)
[![NPM downloads](http://img.shields.io/npm/dm/icestore.svg?style=flat)](https://npmjs.org/package/icestore)

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