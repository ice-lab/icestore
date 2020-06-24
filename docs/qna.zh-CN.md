---
id: qna
title: 常见问题
---

[English](./qna.md) | 简体中文

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

方法一：

在 tsconfig.json 中设置 `"noImplicitThis": false`。

方法二：

使用到 `this` 时使用断言：`this as any`：

![image](https://user-images.githubusercontent.com/4392234/85499976-318b4280-b615-11ea-9be4-e7f9a79a8463.png)

