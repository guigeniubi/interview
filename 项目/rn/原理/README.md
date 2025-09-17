## Q1：RN 的整体架构是什么？（一句话本质）

**A**：JS 负责描述与协调，原生负责渲染与系统能力，二者通过通信层协作（旧 Bridge / 新 JSI）。

- 线程模型：**JS 线程**（业务/调度）、**原生主线程/UI**（渲染/手势）
- 新架构：**JSI + TurboModules + Fabric** 替代旧 Bridge，降低 JSON 序列化/上下文切换开销。

---

## Q2：旧 Bridge 与新架构（JSI/TurboModules/Fabric）的差异？

**A**：旧 Bridge 走“JSON 序列化 + 异步队列”，新架构“内存互通 + 同步绑定 + 更细粒度更新”。

**旧 Bridge 为什么要序列化**： JS 线程和原生线程之间不能直接共享内存。

- Bridge 缺点：序列化成本高、批次/延迟不可控。

- **JSI**：直接将 C++ 方法暴露给 JS（Hermes/V8），可同步调用、零/少拷贝,减少了序列化。

- **TurboModules**：模块按需、懒加载、类型安全（Codegen），减少启动成本。

- **Fabric**：新的渲染管线，**Shadow Tree** 与原生树强一致；更快的 diff/commit，更好的一致性。

---

## Q3：渲染流程是怎样的？（从 JSX 到屏幕）

**A**：JSX → Fiber 协调 → 生成最小变更 → 通过桥接层提交 → 原生创建/更新视图 → 布局与绘制。

- 布局引擎：**Yoga**（Flexbox 实现）计算布局，避免 JS 线程参与布局细节。
- 提交策略：**批量/合帧** 提交，减少跨层通信次数与 UI 抖动。
- Fabric 下：**Shadow Tree** 多版本，支持并发/事务式 commit，避免“半更新”状态。

---

## Q4：动画为什么会卡？如何让动画丝滑？

**A**：JS 驱动动画需跨线程与桥接，遇到 JS 堵塞就掉帧；把动画计算放到原生/独立运行时即可。

- 方案对比：
  - JS 驱动（Animated legacy）→ 灵活但易受 JS 卡顿影响。
  - **原生驱动**（Animated with native driver）→ 插值在原生执行。
  - **Reanimated 2/3**（worklet on UI runtime）→ 动画/手势在 UI 线程执行，**跟手**。
- 实践：
  - 手势跟随：`react-native-gesture-handler + react-native-reanimated`。
  - 复杂绘制：`@shopify/react-native-skia` 在原生管线绘制。

---

## Q5：如何优化性能？（面试可按清单回答）

**A**：目标是“少渲染、少跨层、少阻塞、少体积、少 IO”。

- **渲染**：`React.memo`、`useCallback/useMemo`、稳定的 `key`、分片更新（虚拟列表：FlatList/FlashList）。
- **跨层**：合并批量命令；避免每帧 setState；动画/手势放到原生/Worklet；减少频繁量测（`measure`）。
- **图片**：固定尺寸避免 CLS；使用 WebP/AVIF；缓存（FastImage/coil/glide）。
- **网络**：请求去重/合并；指数退避；SSE/WS 流式时做 **缓冲 + 合帧**（rAF/16–33ms 批量 setState）。
- **启动**：按需注册模块（TurboModules）、懒加载路由/资源、Hermes + Proguard/R8/Bitcode(OLD)/App Thinning。
- **存储**：选择更快的 KV（MMKV）、避免 JSON 大对象频繁序列化。

---

## Q6：Hermes 有什么价值？

**A**：针对 RN 的轻量 JS 引擎，**启动更快、内存更低**，支持 JSI、采样性能分析。

- 字节码预编译（bytecode），减少运行时解析。
- 更小的内存占用与 APK/IPA 体积（结合压缩/拆包）。
- 和 Reanimated/JSI 协作更稳定。

---

## Q7：热更新（CodePush/自建）原理与边界？

**A**：以“**JS Bundle 动态替换**”为核心，只能改 JS/资源，不能改原生二进制。

- 流程：版本检测 → 下载（差分）→ 校验 → 原子切换 → 回滚。
- 边界：**原生变更需要发版**；注意 Apple 政策（不得下载可执行二进制）；JS/原生接口需向后兼容。
- 风险控制：灰度 + 崩溃率监控 + 自动回滚；Bundle 校验（hash/签名）。

---

## Q8：如何定位“卡顿/掉帧/内存泄漏”？

**A**：用对工具 + 最小复现场景。

- 工具：**Flipper**（Layout/Network/React DevTools、Perf Monitor）、**Hermes Sampling Profiler**、Xcode Instruments、Android Profiler、`Systrace`。
- 方法：性能录制（10–20s）、找 Main/UI 线程长任务；剖析频繁渲染组件（React DevTools Profiler）。
- 泄漏排查：未清理定时器/监听、闭包持有大对象、全局缓存未释放、导航栈残留。

---

## 一句话总括

**用 JSI/Fabric 降跨层成本，用 Reanimated/Skia 提升交互丝滑，用清单化手段治理渲染/网络/图片/启动四大瓶颈。**
