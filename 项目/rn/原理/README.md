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

## 6. 热更新原理

### 核心思想

React Native 热更新基于 **JS Bundle 动态替换** 实现，无需重新安装 App 即可更新业务逻辑。

### 实现原理

**1. Bundle 分离**

```js
// 基础 Bundle（原生能力，很少变化）
const nativeModules = require("react-native");

// 业务 Bundle（频繁更新）
const businessLogic = require("./src/App");
```

**2. 版本检测与下载**

```js
const checkUpdate = async () => {
  const remoteVersion = await fetch("/api/version").then((r) => r.json());
  const localVersion = await AsyncStorage.getItem("bundleVersion");

  return remoteVersion > localVersion ? downloadNewBundle(remoteVersion) : null;
};

// 函数式下载流程
const downloadNewBundle = pipe(
  fetchBundleUrl,
  downloadWithProgress,
  validateChecksum,
  saveToLocal
);
```

**3. Bundle 切换机制**

```js
// 应用启动时选择 Bundle
const loadBundle = () => {
  const latestBundle = getLatestValidBundle();

  try {
    // 加载新 Bundle
    require(latestBundle);
  } catch (error) {
    // 降级到安全 Bundle
    require("./fallback.bundle.js");
  }
};
```

### 技术实现方案

**CodePush 流程**：

1. **检测更新**：App 启动时对比版本号
2. **下载差分包**：只下载变更部分，减少流量
3. **原子替换**：下载完成后一次性替换整个 Bundle
4. **回滚机制**：新版本崩溃时自动回退到稳定版本

**函数式热更新管理**：

```js
const createHotUpdateManager = () => ({
  check: () => checkForUpdates(),
  download: pipe(fetchUpdate, validateBundle, cacheBundle),
  apply: (bundle) => switchBundle(bundle),
  rollback: () => revertToSafeBundle(),
  cleanup: () => removeOldBundles(),
});
```

### 限制与注意事项

- **只能更新 JS 代码**：原生代码变更仍需发版
- **Apple 政策**：避免下载可执行代码，需谨慎使用
- **版本兼容性**：确保新 Bundle 与原生模块版本匹配
- **网络策略**：支持增量更新和断点续传

---
