# useChat Hook 文档

> useChat 是一个用于处理聊天对话的 React Hook，支持 SSE 流式响应、多模态输入输出、错误重试等特性。

## 核心特性

- **SSE 流式响应**：实时接收服务器推送的消息
- **多模态支持**：文本、图片、语音、视频等多种输入输出格式
- **错误处理与重试**：完善的错误处理和自动重试机制
- **状态管理**：完整的聊天状态管理
- **选项生成**：智能对话选项生成

## SSE 实现原理

### 1. 基本流程

```javascript
// 核心实现步骤
1. 创建 AbortController 用于请求控制中断
2. 使用 fetch 发起 POST 请求，设置 textStreaming: true
3. 获取 response.body.getReader() 进行流式读取
4. 使用 EventSourceParser 解析 SSE 数据
5. 实时更新 UI 状态
```

### 2. 数据解析

- 使用 `eventsource-parser` 库解析 SSE 数据流
- 支持 `event` 和 `reconnect-interval` 两种事件类型
- 实时处理 `content`、`ttsInfo`、`imageInfo` 等数据

### 3. 流式更新

- 通过 `setInterval` 实现字符级别的流式显示
- 支持思考文本（thinkingText）和普通文本的分流处理
- 动态切换不同的输出类型（对话、故事、图片等）

## 错误处理和重试机制

### 1. 错误分类

- **网络错误**：连接失败、超时等
- **业务错误**：服务器返回的错误码
- **生成错误**：内容生成失败
- **选项生成错误**：对话选项生成失败

### 2. 重试策略

```javascript
// 重试逻辑
1. 检查后端是否仍在生成 (getIsGenerating)
2. 如果正在生成：使用 SseSessionReconnect 重连
3. 如果已停止：使用 SseFailureRetry 重试
4. 从历史记录恢复状态 (restoreFromHistory)
```

### 3. 错误恢复

- **会话重连**：`SseSessionReconnect` 重新建立连接
- **失败重试**：`SseFailureRetry` 重新发送请求
- **历史恢复**：从后端获取历史记录恢复状态
- **选项重试**：重新生成对话选项

## 多模态实现

### 1. 输入类型

- **文本输入**：`SseDialogInput`、`SseStoryInput`
- **图片输入**：`UserImageInput` 支持图片识别
- **礼物输入**：`SseSendGift` 支持礼物互动
- **群聊操作**：`SseStoryInput` 支持群聊角色管理

### 2. 输出类型

- **对话输出**：`SseDialogOutput` 普通对话回复
- **故事输出**：`SseStoryOutput` 剧情发展
- **图片输出**：`SseImageOutput` 生成图片
- **视频输出**：`SseDynamicCharacterOutput` 动态角色视频
- **TTS 输出**：语音合成信息

### 3. 多模态处理

```javascript
// 多模态数据流处理
1. 根据 outputType 分类处理不同类型的数据
2. 图片数据：处理 imageInfo 和 imageAssemble
3. 视频数据：处理 dynamicBackgroundVideoUrl
4. 语音数据：处理 ttsInfo 和音频播放
5. 选项数据：处理对话和故事选项
```

## 状态管理

### 1. 核心状态

- `messages`：聊天消息列表
- `options`：对话选项列表
- `isGenerating`：是否正在生成内容
- `isBackendGenerating`：后端是否正在生成
- `error`：错误状态

### 2. 生成状态

- `isGeneratingSayOptions`：是否正在生成对话选项
- `isGeneratingDoOptions`：是否正在生成故事选项
- `isBackendGenerating`：后端生成状态

### 3. 消息管理

- 支持消息的增删改查
- 消息类型识别和分类
- 消息历史记录管理
- 消息重试和恢复

## 主要 API

### 1. 核心方法

- `append(message)`：发送消息
- `stop()`：停止生成
- `retryAfterFailed()`：失败后重试
- `historyRetry(id)`：历史消息重试
- `continueChat(role)`：继续对话

### 2. 选项相关

- `generateOptions()`：生成对话选项
- `retryOptionsAfterFailed()`：选项生成失败重试
- `restoreOptionsFromHistory()`：从历史恢复选项

### 3. 多模态方法

- `sendGiftChat(data)`：发送礼物
- `handleGroupChatUpdate(characters)`：群聊角色更新
- `removeVideoMessage()`：移除视频消息

## 配置选项

### 1. 请求配置

```javascript
interface UseChatProps {
  sceneId: string; // 场景ID
  url: string; // 请求URL
  chatRequestOptions?: {
    // 请求选项
    headers?: Record<string, string>,
    body?: Record<string, any>,
  };
}
```

### 2. 回调函数

- `onResponse`：响应回调
- `onError`：错误回调
- `onStart`：开始回调
- `onFinish`：完成回调
- `onTTS`：TTS 回调
- `onChangeBackgroundVideo`：背景视频变化回调

## 使用示例

```javascript
const { messages, append, stop, isGenerating, error, retryAfterFailed } =
  useChat({
    sceneId: "your-scene-id",
    url: "your-api-url",
    onResponse: (response) => console.log(response),
    onError: (error) => console.error(error),
  });

// 发送文本消息
await append({
  content: "Hello",
  role: RoleType.UserInput,
  type: YunjingServiceChatInputType.SseDialogInput,
});
```

## 性能优化

### 1. 内存管理

- 使用 `AbortController` 及时取消请求
- 清理定时器和事件监听器
- 避免内存泄漏

### 2. 状态优化

- 使用 `useCallback` 缓存函数
- 使用 `useRef` 保存最新值
- 避免不必要的重新渲染

### 3. 网络优化

- 支持请求重试和重连
- 错误状态恢复
- 流式数据处理

## 注意事项

1. **依赖管理**：确保所有依赖项正确安装
2. **错误处理**：始终处理可能的错误情况
3. **资源清理**：组件卸载时清理资源
4. **状态同步**：保持前后端状态同步
5. **用户体验**：提供加载状态和错误提示

---

> **总结**：useChat 是一个功能完整的聊天 Hook，通过 SSE 实现实时流式响应，支持多模态交互，具备完善的错误处理和重试机制，适用于各种聊天应用场景。
