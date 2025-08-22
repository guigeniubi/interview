### Hybrid 概览

    •	Hybrid App = 原生容器 + WebView 混合开发
    •	高性能/强体验链路（首页、消息、支付）走原生；
    •	高频迭代业务（活动页、资讯、表单）走 H5，由 WebView 承载。

### 优缺点

优势：
• 开发成本低：H5 一处开发，多端可复用。
• 上线快：H5 可热更新，无需应用商店审核。

劣势：
• 首屏体验：相比原生更易白屏，流畅度偏弱。
• 交互割裂：手势/动画/系统能力需桥接，体验一致性成本高。

⸻

### 启动与加载策略

• 预加载 WebView：App 冷启动时提前创建/预热 WebView，减少首进白屏。
• 离线包（本地直出）：将 H5 资源打包入 App，优先本地加载；网络失败可回源。
• 增量更新：差量下发资源，仅更新变更文件，降低包体积与下载耗时。
• 缓存复用：复用 WebView 实例与进程，避免频繁销毁重建。

加载顺序建议：
• App 启动 → 预热 WebView → 校验/应用离线包 → 进入容器页 → 加载 H5 → 注入 JSBridge。

⸻

### H5 ↔ Native 通信（JSBridge）

方向一：H5 → Native
• 调用方式（iOS）：`window.webkit.messageHandlers.<name>.postMessage(payload)`
• 协议结构：`{ action, params, requestId }`
• 返回通道：原生回调携带相同 `requestId`，保证请求-响应配对。

方向二：Native → H5
• 页面前置注入：`injectedJavaScriptBeforeContentLoaded` 注入初始化脚本（创建 `NativeBridge`、能力探测等）。
• 运行时推送：原生通过 `evaluateJavaScript`/`postMessage` 主动下发事件与数据（如登录态、主题、网络变化）。

⸻

### 性能优化要点（H5 为主）

• 首屏：离线包直出、接口并行、骨架屏、避免阻塞脚本。
• WebView：启用/复用渲染进程，减少实例重建；谨慎使用同步 JS 注入。

⸻

### iOS/Android 初始化要点

iOS（WKWebView）：
• 预加载：持有 WKWebView 单例或对象池；后台提前创建与加载空白页。
• 注入：使用 `injectedJavaScriptBeforeContentLoaded` 注入 `NativeBridge` 初始化脚本。
• 通信：`window.webkit.messageHandlers.<name>.postMessage`；原生实现 `WKScriptMessageHandler`。

Android（WebView）：
• 预加载：提前创建 `WebView`，设置通用配置（缓存、UA、硬件加速）。
• 注入：`addJavascriptInterface(obj, 'NativeBridge')`（注意混淆与 @JavascriptInterface 安全）。
• 通信：`evaluateJavascript` 回调 H5；或 `postMessage`/`WebMessagePort`（新 API）。
