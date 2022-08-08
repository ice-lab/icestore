---
id: qna
title: 常见问题
---

## 在 TypeScript 项目中 Model 内无法使用 `this`

![image](https://user-images.githubusercontent.com/4392234/85498836-09024900-b613-11ea-9150-8287b4455e92.png)

### 原因

`tsconfig.json` 里面设置了：

```json
{
  "compilerOptions": {
    "strict": true,

    // 或
    "noImplicitThis": true,
  }
}
```

### 解决方法

> 更推荐使用方法一，可以获得完善的 TS 类型提示

方法一：使用 `createModel` 工具方法来包裹你的 model 对象

```diff
+ import { createModel } from '@ice/store';

- const counter = {
+ const counter = createModel({
    state: 0,
    reducers: {
      increment: (prevState) => prevState + 1,
      decrement: (prevState) => prevState - 1,
    },
    effects: () => ({
      async asyncDecrement() {
        await delay(1000);
        this.decrement();
      },
    }),
- };
+ });
```

![image](https://user-images.githubusercontent.com/42671099/163668927-2a30ec43-7c49-4973-ae15-1035a0386ca7.png)

方法二：使用 `dispatch`

```diff
const counter = {
  state: 0,
  reducers: {
    increment: (prevState) => prevState + 1,
    decrement: (prevState) => prevState - 1,
  },
-  effects: () => ({
+  effects: (dispatch) => ({
    async asyncDecrement() {
      await delay(1000);
-     // this.decrement();
+     dispatch.counter.decrement();
    },
  }),
};
```
