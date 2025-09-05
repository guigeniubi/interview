## Q1：什么是 Hybrid App？为什么用它？

**A**：原生容器 + WebView 混合开发，取长补短。

- 高频体验/性能敏感场景（首页、消息、支付）用原生。
- 高频迭代/活动页/表单/资讯类用 H5，快迭代、可热更新。

---

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

## 一句话总括

**Hybrid = 原生保性能，H5 保灵活，用 JSBridge 粘合，预加载 + 离线包 保体验。**
