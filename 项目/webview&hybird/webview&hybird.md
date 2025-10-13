## Q2：Hybrid 的优缺点？

**A**：

- 优势：跨端复用、上线快（H5 热更新免审核）。
- 劣势：首屏白屏风险、流畅度弱；交互/系统能力依赖桥接。

---

## Q3：H5 ↔ Native 如何通信？

**A**：通过 **JSBridge**。

- H5 → Native：
  - iOS：`window.webkit.messageHandlers.<name>.postMessage(payload)`。
  - Android：`NativeBridge.xxx()`（`addJavascriptInterface` 暴露）。
  - 协议：`{ action, params, requestId }`；回调带相同 `requestId` 配对。
- Native → H5：
  - 注入初始化脚本（`injectedJavaScriptBeforeContentLoaded`/`addJavascriptInterface`）。
  - 运行时下发：`evaluateJavaScript` / `postMessage`。

---

## Q4：Hybrid 性能优化要点？

**A**：

- 预加载 WebView（冷启动提前创建/预热）。
- 离线包（资源内置 App，本地优先，失败回源）。
- 增量更新（差量下发，减体积/时延）。
- 缓存复用（WebView 复用实例/进程，避免频繁销毁）。
- 加载顺序：启动 → 预热 → 校验离线包 → 容器页 → 加载 H5 → 注入 JSBridge。

### 离线包核心要点

**1. 离线包架构**

- 资源打包：HTML/CSS/JS 等静态资源打包成 zip
- 版本管理：通过 version 字段控制更新
- 完整性校验：MD5/SHA256 校验包完整性
- 资源拦截：WebView 拦截网络请求，优先使用本地资源

**2. 更新策略**

- 增量更新：只下载变更文件，减少流量消耗
- 灰度发布：按用户比例逐步推送更新
- 回滚机制：更新失败时回退到上一版本
- 强制更新：关键版本强制用户更新

**3. 存储管理**

- 本地存储：App 沙盒目录存储离线包
- 空间控制：设置最大存储空间，LRU 清理旧包
- 权限管理：确保资源访问权限正确

### WebView 预加载核心要点

**1. 预热策略**

- 应用启动时创建 WebView 实例池
- 预加载基础资源（vendor.js、common.css）
- 注入 JSBridge，提前建立通信通道
- 配置优化：硬件加速、缓存策略、UA 设置

**2. 对象池管理**

- 维护 WebView 对象池，避免频繁创建销毁
- 池大小控制：根据设备性能动态调整
- 状态重置：使用前清理历史状态和缓存
- 内存监控：及时释放不用的 WebView 实例

**3. 智能预加载**

- 用户行为分析：基于历史访问预测下一步操作
- 网络状态适配：WiFi 积极预加载，4G 适度预加载
- 关键路径优化：优先预加载首屏关键资源
- 后台预加载：利用空闲时间预加载非关键页面

**4. 性能监控**

- 加载时间：监控首屏加载时间
- 内存使用：监控 WebView 内存占用
- 错误率：统计加载失败和 JS 错误
- 网络请求：监控资源请求数量和大小

---

## Q5：iOS / Android 初始化要点？

**A**：

- **iOS (WKWebView)**：
  - 单例/对象池预加载。
  - `injectedJavaScriptBeforeContentLoaded` 注入 `NativeBridge`。
  - `postMessage` + `WKScriptMessageHandler` 处理通信。
- **Android (WebView)**：
  - 提前创建 WebView，设置缓存/UA/硬件加速。
  - `addJavascriptInterface(obj, "NativeBridge")`（注意 @JavascriptInterface + 混淆安全）。
  - 通信：`evaluateJavascript` / `postMessage` / `WebMessagePort`。

---
