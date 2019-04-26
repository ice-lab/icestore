# Ice Store

[![NPM version](https://img.shields.io/npm/v/icestore.svg?style=flat)](https://npmjs.org/package/icestore)
[![NPM downloads](http://img.shields.io/npm/dm/icestore.svg?style=flat)](https://npmjs.org/package/icestore)

基于 React Hooks 的数据流方案。

---

## 快速上手

### 安装

```
$ npm install icestore --save
```

### 声明 Store

```javascript
// src/stores/materials.js
export default {
  dataSource: [],
  async refresh() {
    this.dataSourde = await (await fetch(/* api */)).json();
  },
  add(project) {
    this.dataSourde.push(project);
  },
  async action() {
    // ...
  },
  actionSync() {
    // ...
  },
};
```

### 注册 Store

```javascript
// src/stores/index.js
import materials from './materials';
import Icestore from 'icestore';

const icestore = new Icestore();
icestore.registerStore('materials', materials);

export default icestore;
```

### 在 View 中使用

```javascript
// src/pages/Material/index.js
import React, { useEffect } from 'react';
import ReactDOM from 'react-dom';
import stores from '../../stores';

const Material = () => {
  const materials = stores.useStore('materials');
  const {  dataSource } = materials;

  useEffect(() => {
    materials.refresh();
  }, []);

  return (
    <div>
      <h2>Material</h2>
      <div>
        {dataSource.map(({ name }) => name)}
      </div>
    </div>
  );
};

ReactDOM.render(
  <Material />,
  document.body
);
```