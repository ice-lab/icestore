# icestore-debug

> icestore 调试 middleware


## 安装

```bash
npm install @ice/store-debug --save
```

## 简介

`icestore-debug` 是 `icestore` 官方提供的调试中间件，使用该中间件用户可以方便地跟踪 state 的 diff、触发 action 等信息，提升问题排查效率。

## 快速开始

在注册 store 之前，使用 `applyMiddleware` 方法将 debug 中间件加入到中间件队列中

```javascript
import todos from './todos';
import Icestore from '@ice/store';
import debug from '@ice/store-debug';

const icestore = new Icestore();

icestore.applyMiddleware(debug);
icestore.registerStore('todos', todos);
```

注册成功后，当 `store` 中的 action 被调用时，在浏览器的 DevTools
中将能看到实时的日志：

<img src="https://user-images.githubusercontent.com/5419233/62607025-ee0de400-b92f-11e9-8936-6b6370672f27.png"  width="320" />

日志中包含以下几个部分：

* Store name: 当前子 store 对应的 namespace
* Action type: 触发的 action 名
* Added / Deleted / Updated: state 变化的 diff
* New state: 更新后的 state
* Old state: 更新前的 state

## Todos

- [ ] 全局查询所有 store 中的 state

## Contributors

欢迎反馈问题 [issue 链接](https://github.com/alibaba/ice/issues/new)
如果对 `icestore` 感兴趣，欢迎参考 [CONTRIBUTING.md](https://github.com/alibaba/ice/blob/master/.github/CONTRIBUTING.md) 学习如何贡献代码。

## License

[MIT](LICENSE)

