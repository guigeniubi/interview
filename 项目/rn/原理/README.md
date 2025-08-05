# React Native 原理简介

## 1. 架构总览

React Native 采用“三端分离”架构：

- **JavaScript 线程**：负责业务逻辑和 UI 描述。
- **原生主线程**：负责原生 UI 渲染和动画。
- **Bridge（桥接）线程**：负责 JS 与原生的通信。

## 2. JS 与原生通信机制（Bridge）

- JS 端与原生端通过 Bridge 进行异步消息传递。
- 所有原生能力都可通过 Bridge 封装为 JS 可调用的模块和方法。

**函数式调用示例：**

```js
const callNative = (module, method, params) =>
  Bridge.send(JSON.stringify({ module, method, params }));

const onNativeCallback = (callback) => Bridge.on("nativeCallback", callback);
```

## 3. 渲染流程

- React 组件描述 UI，React 负责 diff 算法，生成最小变更集。
- 变更集通过 Bridge 发送给原生端，原生端根据变更集更新 UI。

## 4. 性能优化要点

- **减少不必要的重渲染**：`React.memo`、`useMemo`、`useCallback`。
- **列表优化**：`FlatList` 替代 `ScrollView`。
- **图片优化**：现代格式、懒加载、缓存。
- **网络优化**：请求合并、缓存、去重。

**函数式优化示例：**

```js
const memoizedValue = useMemo(() => computeExpensiveValue(a, b), [a, b]);
const memoizedCallback = useCallback(() => handleEvent(id), [id]);
```

## 5. 新架构（Fabric & JSI 简介）

- JSI（JavaScript Interface）替代传统 Bridge，支持同步调用，提升通信效率。
- Fabric 渲染引擎让 JS 端和原生端 UI 树保持同步，提升一致性和性能。

---

！
