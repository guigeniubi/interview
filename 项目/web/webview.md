# WebView 和 React Native 通信详解

> WebView 和 React Native 的通信是混合开发中的重要技术，涉及 JavaScript 和原生代码之间的数据传递和方法调用。

## 目录

- [通信方式](#通信方式)
- [WebView 到 RN 通信](#webview-到-rn-通信)
- [RN 到 WebView 通信](#rn-到-webview-通信)
- [实现原理](#实现原理)
- [常见面试题](#常见面试题)
- [最佳实践](#最佳实践)

## 通信方式

### 1. 基本通信模式

```javascript
// 双向通信架构
WebView (JavaScript) ←→ React Native (Native Bridge) ←→ Native Code
```

### 2. 主要通信方式

| 通信方向     | 方法               | 特点             |
| ------------ | ------------------ | ---------------- |
| WebView → RN | `postMessage`      | 异步、安全、推荐 |
| RN → WebView | `injectJavaScript` | 同步、直接执行   |
| RN → WebView | `onMessage`        | 异步、事件驱动   |

## WebView 到 RN 通信

### 1. 使用 postMessage

```javascript
// WebView 内部发送消息
function sendMessageToRN(data) {
  // 检查是否在 WebView 环境中
  if (window.ReactNativeWebView) {
    window.ReactNativeWebView.postMessage(
      JSON.stringify({
        type: "USER_ACTION",
        data: data,
      })
    );
  }
}

// 示例：发送用户点击事件
document.getElementById("button").addEventListener("click", () => {
  sendMessageToRN({
    action: "BUTTON_CLICK",
    timestamp: Date.now(),
    userId: "user123",
  });
});
```

### 2. RN 端接收消息

```javascript
import React from "react";
import { WebView } from "react-native-webview";

const MyWebView = () => {
  const handleMessage = (event) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      console.log("收到 WebView 消息:", data);

      switch (data.type) {
        case "USER_ACTION":
          handleUserAction(data.data);
          break;
        case "FORM_SUBMIT":
          handleFormSubmit(data.data);
          break;
        default:
          console.log("未知消息类型:", data.type);
      }
    } catch (error) {
      console.error("解析消息失败:", error);
    }
  };

  const handleUserAction = (data) => {
    // 处理用户操作
    if (data.action === "BUTTON_CLICK") {
      // 执行相应逻辑
      console.log("用户点击了按钮");
    }
  };

  return (
    <WebView
      source={{ uri: "https://example.com" }}
      onMessage={handleMessage}
      javaScriptEnabled={true}
      domStorageEnabled={true}
    />
  );
};
```

### 3. 复杂数据传递

```javascript
// WebView 发送复杂数据
function sendComplexData() {
  const complexData = {
    type: "USER_PROFILE",
    data: {
      user: {
        id: "user123",
        name: "John Doe",
        email: "john@example.com",
      },
      preferences: {
        theme: "dark",
        language: "zh-CN",
      },
      actions: [
        { type: "LOGIN", timestamp: Date.now() },
        { type: "LOGOUT", timestamp: Date.now() },
      ],
    },
  };

  window.ReactNativeWebView.postMessage(JSON.stringify(complexData));
}
```

## RN 到 WebView 通信

### 1. 使用 injectJavaScript

```javascript
import React, { useRef } from "react";
import { WebView } from "react-native-webview";

const MyWebView = () => {
  const webViewRef = useRef(null);

  const sendDataToWebView = (data) => {
    const script = `
      (function() {
        // 在 WebView 中执行 JavaScript
        window.receiveDataFromRN(${JSON.stringify(data)});
        true; // 必须返回 true
      })();
    `;

    webViewRef.current?.injectJavaScript(script);
  };

  const updateWebViewContent = () => {
    const script = `
      (function() {
        document.getElementById('content').innerHTML = 'Updated from RN!';
        true;
      })();
    `;

    webViewRef.current?.injectJavaScript(script);
  };

  return (
    <WebView
      ref={webViewRef}
      source={{ uri: "https://example.com" }}
      javaScriptEnabled={true}
    />
  );
};
```

### 2. WebView 端接收数据

```javascript
// WebView 内部接收 RN 数据
window.receiveDataFromRN = function (data) {
  console.log("收到 RN 数据:", data);

  // 处理不同类型的数据
  switch (data.type) {
    case "UPDATE_UI":
      updateUI(data.payload);
      break;
    case "NAVIGATE":
      navigateToPage(data.route);
      break;
    case "SHOW_TOAST":
      showToast(data.message);
      break;
  }
};

function updateUI(payload) {
  // 更新 UI 元素
  if (payload.theme) {
    document.body.className = payload.theme;
  }

  if (payload.content) {
    document.getElementById("content").innerHTML = payload.content;
  }
}

function navigateToPage(route) {
  // 页面导航
  window.location.href = route;
}

function showToast(message) {
  // 显示提示信息
  const toast = document.createElement("div");
  toast.textContent = message;
  toast.className = "toast";
  document.body.appendChild(toast);

  setTimeout(() => {
    document.body.removeChild(toast);
  }, 3000);
}
```

### 3. 使用 onMessage 进行双向通信

```javascript
// RN 端
const MyWebView = () => {
  const webViewRef = useRef(null);

  const handleMessage = (event) => {
    const data = JSON.parse(event.nativeEvent.data);

    // 处理 WebView 消息并回复
    if (data.type === "REQUEST_DATA") {
      const response = {
        type: "RESPONSE_DATA",
        data: {
          userInfo: getUserInfo(),
          settings: getSettings(),
        },
      };

      // 发送回复
      const script = `
        window.receiveResponseFromRN(${JSON.stringify(response)});
        true;
      `;

      webViewRef.current?.injectJavaScript(script);
    }
  };

  return (
    <WebView
      ref={webViewRef}
      source={{ uri: "https://example.com" }}
      onMessage={handleMessage}
    />
  );
};

// WebView 端
function requestDataFromRN() {
  window.ReactNativeWebView.postMessage(
    JSON.stringify({
      type: "REQUEST_DATA",
    })
  );
}

window.receiveResponseFromRN = function (response) {
  console.log("收到 RN 回复:", response);
  // 处理响应数据
};
```

## 实现原理

### 1. 桥接机制

```javascript
// React Native 桥接原理（简化版）
class WebViewBridge {
  constructor(webView) {
    this.webView = webView;
    this.messageQueue = [];
  }

  // 发送消息到 WebView
  postMessage(message) {
    const script = `
      window.ReactNativeWebView.postMessage(${JSON.stringify(message)});
      true;
    `;
    this.webView.injectJavaScript(script);
  }

  // 接收 WebView 消息
  onMessage(event) {
    const data = JSON.parse(event.nativeEvent.data);
    this.handleMessage(data);
  }

  // 处理消息
  handleMessage(data) {
    // 根据消息类型分发处理
    switch (data.type) {
      case "API_CALL":
        this.handleApiCall(data);
        break;
      case "UI_UPDATE":
        this.handleUIUpdate(data);
        break;
    }
  }
}
```

### 2. 消息队列机制

```javascript
// 消息队列实现
class MessageQueue {
  constructor() {
    this.queue = [];
    this.isProcessing = false;
  }

  // 添加消息到队列
  enqueue(message) {
    this.queue.push(message);
    if (!this.isProcessing) {
      this.processQueue();
    }
  }

  // 处理消息队列
  async processQueue() {
    this.isProcessing = true;

    while (this.queue.length > 0) {
      const message = this.queue.shift();
      await this.processMessage(message);
    }

    this.isProcessing = false;
  }

  // 处理单个消息
  async processMessage(message) {
    try {
      // 处理消息逻辑
      await this.handleMessage(message);
    } catch (error) {
      console.error("处理消息失败:", error);
    }
  }
}
```

## 常见面试题

### 1. WebView 和 RN 通信有哪些方式？

**答案：**

- **WebView → RN**：`postMessage` 方法
- **RN → WebView**：`injectJavaScript` 方法
- **双向通信**：`onMessage` 事件监听

**详细说明：**

```javascript
// WebView 发送消息到 RN
window.ReactNativeWebView.postMessage(JSON.stringify(data));

// RN 接收消息
<WebView onMessage={handleMessage} />;

// RN 发送消息到 WebView
webViewRef.current.injectJavaScript(script);
```

### 2. 如何确保通信的安全性？

**答案：**

- 验证消息来源
- 数据格式校验
- 白名单机制
- 加密敏感数据

```javascript
// 安全通信示例
const handleMessage = (event) => {
  // 1. 验证来源
  if (!isValidOrigin(event.origin)) {
    return;
  }

  // 2. 数据格式校验
  const data = JSON.parse(event.nativeEvent.data);
  if (!isValidDataFormat(data)) {
    return;
  }

  // 3. 白名单检查
  if (!isAllowedAction(data.action)) {
    return;
  }

  // 4. 处理消息
  processMessage(data);
};
```

### 3. 如何处理大量数据的传输？

**答案：**

- 分片传输
- 压缩数据
- 异步处理
- 进度回调

```javascript
// 分片传输示例
function sendLargeData(data) {
  const chunkSize = 1000;
  const chunks = [];

  for (let i = 0; i < data.length; i += chunkSize) {
    chunks.push(data.slice(i, i + chunkSize));
  }

  chunks.forEach((chunk, index) => {
    setTimeout(() => {
      window.ReactNativeWebView.postMessage(
        JSON.stringify({
          type: "DATA_CHUNK",
          chunk: chunk,
          index: index,
          total: chunks.length,
        })
      );
    }, index * 100);
  });
}
```

### 4. WebView 性能优化有哪些方法？

**答案：**

- 预加载 WebView
- 缓存机制
- 懒加载
- 资源优化

```javascript
// 性能优化示例
const OptimizedWebView = () => {
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <WebView
      source={{ uri: "https://example.com" }}
      onLoad={() => setIsLoaded(true)}
      cacheEnabled={true}
      cacheMode="LOAD_DEFAULT"
      domStorageEnabled={true}
      javaScriptEnabled={true}
      // 预加载
      startInLoadingState={true}
      // 性能优化
      androidLayerType="hardware"
      androidHardwareAccelerationDisabled={false}
    />
  );
};
```

### 5. 如何处理 WebView 中的错误？

**答案：**

- 错误边界处理
- 重试机制
- 降级方案
- 用户提示

```javascript
// 错误处理示例
const WebViewWithErrorHandling = () => {
  const [hasError, setHasError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  const handleError = (error) => {
    console.error("WebView 错误:", error);
    setHasError(true);

    // 重试机制
    if (retryCount < 3) {
      setTimeout(() => {
        setRetryCount((prev) => prev + 1);
        setHasError(false);
      }, 1000 * (retryCount + 1));
    }
  };

  if (hasError) {
    return <ErrorFallback onRetry={() => setHasError(false)} />;
  }

  return (
    <WebView
      source={{ uri: "https://example.com" }}
      onError={handleError}
      onHttpError={handleError}
    />
  );
};
```

## 最佳实践

### 1. 消息格式标准化

```javascript
// 标准消息格式
const MessageTypes = {
  USER_ACTION: "USER_ACTION",
  API_CALL: "API_CALL",
  UI_UPDATE: "UI_UPDATE",
  ERROR: "ERROR",
  SUCCESS: "SUCCESS",
};

const createMessage = (type, data, id = null) => ({
  id: id || Date.now().toString(),
  type,
  data,
  timestamp: Date.now(),
});

// 使用示例
const message = createMessage(MessageTypes.USER_ACTION, {
  action: "BUTTON_CLICK",
  userId: "user123",
});
```

### 2. 错误处理和重试

```javascript
// 错误处理工具
class CommunicationManager {
  constructor() {
    this.retryAttempts = 3;
    this.retryDelay = 1000;
  }

  async sendMessage(message, retryCount = 0) {
    try {
      await this.postMessage(message);
    } catch (error) {
      if (retryCount < this.retryAttempts) {
        await this.delay(this.retryDelay * (retryCount + 1));
        return this.sendMessage(message, retryCount + 1);
      }
      throw error;
    }
  }

  delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
```

### 3. 类型安全

```javascript
// TypeScript 类型定义
interface WebViewMessage {
  id: string;
  type: string;
  data: any;
  timestamp: number;
}

interface RNMessage {
  type: string;
  payload: any;
}

// 类型检查
function isValidMessage(message: any): message is WebViewMessage {
  return (
    typeof message === 'object' &&
    typeof message.id === 'string' &&
    typeof message.type === 'string' &&
    typeof message.timestamp === 'number'
  );
}
```

---

> **总结**：WebView 和 React Native 的通信是混合开发的核心技术，通过 `postMessage`、`injectJavaScript` 和 `onMessage` 实现双向通信。关键是要注意安全性、性能优化和错误处理。
