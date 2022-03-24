---
id: upgrade-guidelines
title: 从老版本升级
---

## 从 V1 升级到 V2

V2 版本主要变化：

- Pure ESM Packages
- 移除 V1 版本中已被标记为「已过期」的 API

如果你的代码在 icestore V1 下没有任何 Warning，则可以直接升级到 V2 版本。具体包含以下 Warning:

- `useModelActionsState` API has been detected, please use `useModelEffectsState` instead.
- `useModelActions` API has been detected, please use `useModelDispatchers` instead.
- `withModelActions` API has been detected, please use `withModelDispatchers` instead.
- `withModelActionsState` API has been detected, please use `withModelEffectsState` instead.
- Model: Defining effects as objects has been detected, please use \`{ effects: () => ({ effectName: () => {} }) }\` instead.
- Model(${name}): The actions field has been detected, please use \`reducers\` and \`effects\` instead.

针对这些 Warning，可以参考 [icestore V1 文档](https://github.com/ice-lab/icestore/blob/stable/1.x/docs/upgrade-guidelines.zh-CN.md)进行升级。