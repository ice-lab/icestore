# Ice Store

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

const icestore = new Fiy();
icestore.registerStore('materials', materials);

export default icestore;
```

### 在 View 中使用

```javascript
// src/pages/Material/index.js
import React, { useEffect } from 'react';
import stores from '../..//stores';

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

export default Material;
```