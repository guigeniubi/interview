# SSE 和 WebSocket 对比

> Server-Sent Events (SSE) 和 WebSocket 都是实现实时通信的技术，但它们在实现方式、特性和适用场景上有很大差异。

## 基本概念

### SSE (Server-Sent Events)

- **单向通信**：服务器向客户端推送数据
- **基于 HTTP**：使用标准的 HTTP 协议
- **自动重连**：浏览器自动处理重连机制
- **文本格式**：只支持文本数据（UTF-8）

### WebSocket

- **双向通信**：客户端和服务器可以互相发送数据
- **独立协议**：基于 TCP 的自定义协议
- **手动重连**：需要手动实现重连逻辑
- **二进制支持**：支持文本和二进制数据

## 技术对比

| 特性             | SSE                     | WebSocket     |
| ---------------- | ----------------------- | ------------- |
| **通信方向**     | 单向（服务器 → 客户端） | 双向          |
| **协议**         | HTTP/HTTPS              | ws/wss        |
| **连接方式**     | 标准 HTTP 请求          | 握手升级      |
| **数据格式**     | 文本（UTF-8）           | 文本 + 二进制 |
| **重连机制**     | 浏览器自动处理          | 需要手动实现  |
| **浏览器支持**   | 现代浏览器              | 现代浏览器    |
| **代理友好性**   | 友好（标准 HTTP）       | 可能有问题    |
| **防火墙友好性** | 友好（端口 80/443）     | 可能被阻止    |

## 实现方式

### SSE 实现

```javascript
// 客户端
const eventSource = new EventSource("/api/stream");

eventSource.onmessage = (event) => {
  console.log("收到数据:", event.data);
};

eventSource.onerror = (error) => {
  console.error("连接错误:", error);
};

// 服务器端 (Node.js)
app.get("/api/stream", (req, res) => {
  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    Connection: "keep-alive",
  });

  const sendData = () => {
    res.write(`data: ${JSON.stringify({ time: Date.now() })}\n\n`);
  };

  const interval = setInterval(sendData, 1000);

  req.on("close", () => {
    clearInterval(interval);
  });
});
```

### WebSocket 实现

```javascript
// 客户端
const ws = new WebSocket("ws://localhost:8080");

ws.onopen = () => {
  console.log("连接已建立");
  ws.send("Hello Server!");
};

ws.onmessage = (event) => {
  console.log("收到消息:", event.data);
};

ws.onerror = (error) => {
  console.error("WebSocket 错误:", error);
};

// 服务器端 (Node.js)
const WebSocket = require("ws");
const wss = new WebSocket.Server({ port: 8080 });

wss.on("connection", (ws) => {
  console.log("客户端已连接");

  ws.on("message", (message) => {
    console.log("收到消息:", message);
    ws.send("服务器回复: " + message);
  });

  ws.on("close", () => {
    console.log("客户端已断开");
  });
});
```

## 适用场景

### SSE 适用场景

1. **实时通知**

   - 社交媒体通知
   - 邮件提醒
   - 系统状态更新

2. **数据流推送**

   - 股票价格更新
   - 新闻推送
   - 日志流

3. **聊天应用（单向）**

   - 广播消息
   - 系统公告
   - 只读聊天室

4. **监控和仪表板**
   - 服务器状态监控
   - 实时数据展示
   - 进度更新

```javascript
// SSE 示例：实时股票价格
const stockSource = new EventSource("/api/stock-prices");

stockSource.onmessage = (event) => {
  const data = JSON.parse(event.data);
  updateStockPrice(data.symbol, data.price);
};
```

### WebSocket 适用场景

1. **实时聊天**

   - 双向对话
   - 群聊功能
   - 在线客服

2. **游戏应用**

   - 多人游戏
   - 实时对战
   - 游戏状态同步

3. **协作工具**

   - 实时文档编辑
   - 白板协作
   - 代码协作

4. **实时应用**
   - 在线会议
   - 直播互动
   - 实时投票

```javascript
// WebSocket 示例：实时聊天
const chatWs = new WebSocket("ws://localhost:8080/chat");

chatWs.onmessage = (event) => {
  const message = JSON.parse(event.data);
  displayMessage(message);
};

function sendMessage(text) {
  chatWs.send(
    JSON.stringify({
      type: "message",
      content: text,
      timestamp: Date.now(),
    })
  );
}
```

## 选择建议

### 选择 SSE 的情况

- ✅ 只需要服务器向客户端推送数据
- ✅ 需要简单的实现和维护
- ✅ 需要自动重连机制
- ✅ 需要良好的代理和防火墙兼容性
- ✅ 数据量相对较小且为文本格式

### 选择 WebSocket 的情况

- ✅ 需要双向实时通信
- ✅ 需要发送二进制数据
- ✅ 需要低延迟和高性能
- ✅ 需要复杂的实时交互功能
- ✅ 可以处理连接管理的复杂性

## 性能考虑

### SSE 性能特点

- **连接开销**：每次连接都有 HTTP 开销
- **数据格式**：文本格式，体积相对较大
- **重连机制**：自动重连，但可能产生延迟
- **并发限制**：受浏览器连接数限制

### WebSocket 性能特点

- **连接开销**：初始握手后开销较小
- **数据格式**：支持二进制，体积更小
- **重连机制**：需要手动实现，但更灵活
- **并发支持**：更好的并发处理能力

## 实际应用示例

### 新闻推送系统（SSE）

```javascript
// 使用 SSE 推送新闻更新
const newsSource = new EventSource("/api/news-stream");

newsSource.onmessage = (event) => {
  const news = JSON.parse(event.data);
  addNewsItem(news);
};
```

### 在线聊天室（WebSocket）

```javascript
// 使用 WebSocket 实现聊天室
const chatRoom = new WebSocket("ws://localhost:8080/chatroom");

chatRoom.onmessage = (event) => {
  const message = JSON.parse(event.data);
  if (message.type === "user_joined") {
    addUserToList(message.user);
  } else if (message.type === "chat_message") {
    addMessageToChat(message);
  }
};
```

## 总结

| 场景         | 推荐技术  | 原因                     |
| ------------ | --------- | ------------------------ |
| 实时通知推送 | SSE       | 简单、自动重连、单向足够 |
| 实时聊天     | WebSocket | 双向通信、低延迟         |
| 数据监控     | SSE       | 单向推送、易于实现       |
| 在线游戏     | WebSocket | 双向、低延迟、复杂交互   |
| 协作编辑     | WebSocket | 双向、实时同步           |
| 新闻推送     | SSE       | 单向、简单可靠           |

---

> **总结**：SSE 适合简单的单向数据推送场景，WebSocket 适合复杂的双向实时交互场景。选择时需要考虑通信方向、数据格式、实现复杂度等因素。
