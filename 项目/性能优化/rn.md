# React Native 性能优化指南

## 一、启动性能优化

1. **减少 JS Bundle 体积**

   - 使用 `hermes` 引擎（默认开启）；
   - 启用代码分割与懒加载；
   - 删除未使用的 polyfill、debug 库；
   - 启用 Proguard（Android）与 Dead Code Elimination。

2. **优化 App 启动流程**

   - 延迟加载非关键模块（如埋点、广告、推送）；
   - 启用 `InteractionManager.runAfterInteractions`；
   - 缓存首屏数据（AsyncStorage / SQLite）。

3. **预加载资源**
   - 使用 `Image.prefetch()`、`Font.loadAsync()`；
   - 将常用图片打包至 assets 中；
   - iOS 使用 Launch Screen，Android 使用 SplashScreen。

---

## 二、渲染性能优化

1. **减少不必要的重渲染**

   - 使用 `React.memo`、`useCallback`、`useMemo`；
   - 拆分大组件，控制 state 粒度；
   - 使用 FlatList 的 `keyExtractor`、`getItemLayout` 优化长列表。

2. **虚拟化列表优化**

   - 使用 `removeClippedSubviews`；
   - 预估 item 高度；
   - 使用 `initialNumToRender` 控制首屏渲染数量；
   - 启用 `windowSize` 扩大视图缓存。

3. **使用动画驱动线程**
   - 使用 `react-native-reanimated` 或 `Animated` 的 native driver；
   - 避免 JS 线程频繁 setState；
   - 尽量使用 LayoutAnimation / GestureHandler 代替 JS 动画。

---

## 三、内存与线程优化

1. **避免内存泄漏**

   - 在组件卸载时清理计时器 / 订阅：
     ```ts
     useEffect(() => {
       const id = setInterval(doSomething, 1000);
       return () => clearInterval(id);
     }, []);
     ```
   - 取消未完成的异步请求；
   - 避免在 useEffect 中闭包旧引用。

2. **优化 JS 与 Native 通信**

   - 合理使用 bridge，避免高频调用；
   - 使用 TurboModules / JSI 实现高性能交互；
   - 批量发送数据代替单次频繁调用。

3. **线程分配**
   - 繁重计算放入 WebWorker（如 react-native-multithreading）；
   - UI 操作保持在主线程。

---

## 四、网络与图片优化

1. **网络优化**

   - 使用缓存层（如 react-query）；
   - 启用 Gzip / Brotli 压缩；
   - 对请求添加超时与重试机制；
   - 合并请求、启用 HTTP/2。

2. **图片加载优化**
   - 使用 `react-native-fast-image`（支持缓存、占位图、渐进加载）；
   - 压缩图片尺寸，使用 WebP 格式；
   - 为大图添加缩略图占位；
   - 避免使用 require 动态路径加载图片。

---

## 五、打包与构建优化

1. **使用 Hermes 引擎**

   - 减少 JS 解析时间；
   - 提升内存利用率；
   - 支持 JSI 提高跨语言性能。

2. **减小包体积**

   - 移除 debug 包、log 模块；
   - 使用 `react-native-bundle-visualizer` 分析依赖；
   - Android 使用 `shrinkResources true`；
   - iOS 使用 bitcode 与 App Thinning。

3. **多环境构建**
   - 使用 `.env` 管理环境变量；
   - 仅在必要环境启用调试；
   - 不在生产包中保留 devtools。

---

## 六、性能监控与分析

1. **性能监控**

   - 使用 Flipper（性能插件）分析 JS FPS、UI FPS；
   - 集成 Sentry / Firebase Performance 监控；
   - 自定义日志埋点：记录启动耗时、渲染耗时。

2. **调试工具**
   - `react-devtools` 检查渲染；
   - `why-did-you-render` 检测多余更新；
   - `adb logcat` 分析 Android 性能日志。

---

## 七、UI 交互优化建议

1. **避免卡顿**

   - 大量动画使用 Reanimated；
   - 滚动列表使用 PureComponent；
   - 使用批量更新和 InteractionManager 延迟任务。

2. **优化导航体验**

   - 使用 `react-navigation` 的 lazy 选项；
   - 对 Stack 屏幕使用 `detachInactiveScreens`；
   - 使用 `TransitionPresets` 控制动画性能。

3. **降低输入延迟**
   - 避免在 TextInput 的 onChangeText 中执行复杂逻辑；
   - 使用 debounce 节流输入。

---

## ✅ 总结

React Native 性能优化的关键在于：

1. **启动快**（预加载 + 延迟加载）；
2. **渲染稳**（列表优化 + 动画驱动）；
3. **通信快**（减少 bridge 调用 + Hermes + JSI）；
4. **包体小**（资源压缩 + 依赖精简）；
5. **监控全**（Flipper + Sentry + 自定义埋点）。

目标是：**让跨端体验接近原生，交互流畅不卡顿。**
