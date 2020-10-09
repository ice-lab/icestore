---
id: ana
title: Q & A
---

English | [简体中文](./qna.zh-CN.md)

## Cannot use `this` within a model in a TypeScript project

![image](https://user-images.githubusercontent.com/4392234/85498836-09024900-b613-11ea-9150-8287b4455e92.png)

### Why?

`tsconfig.json` has:

```json
{
  "compilerOptions": {
    "strict": true,

    // or
    "noImplicitThis": true,
  }
}
```

### How?

Method 1: Use `dispatch`

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

Method 2:

Set `"noImplicitThis": false` in tsconfig.json.

Method 3:

Replace `this` use `this as any`:

![image](https://user-images.githubusercontent.com/4392234/85499976-318b4280-b615-11ea-9be4-e7f9a79a8463.png)

