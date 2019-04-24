# fiy

基于 React Hooks 的数据流方案。

## 如何使用

### 声明 Store

```javascript
// src/stores/materials.js
export default {
  dataSource: [],
  async refresh() {
    this.dataSourde = await fetch(/* api */);
  },
  add(project) {
    this.dataSourde = [].concat(this.dataSource).concat([project]) };
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
import React from 'react';
import materials from './materials';
import Fiy from 'fiy';

const fiy = new Fiy(React);
fiy.registerStore('materials', materials);

export default fiy;
```

### 在 View 中使用

```javascript
import React, { useEffect } from 'react';
import stores from '@src/stores';

const Material = () => {
  const materials = stores.useStore('materials');
  const {  dataSource } = materials;

  useEffect(() => {
    (async () => {
      await materials.refresh();
    })();
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

export default Material;
```