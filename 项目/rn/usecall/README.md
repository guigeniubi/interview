# useCall 逻辑与重点说明

## 1. 作用简介

`useCall` 是一个用于管理音视频通话（主要是音频通话）全流程的 React Hook，基于 XRTC 实现。它封装了通话的建立、心跳、音频流管理、状态同步、异常处理等核心逻辑，适用于 React Native 项目。

---

## 2. 主要功能点

- **通话建立与连接管理**：支持发起、重连、断开、结束通话。
- **心跳机制**：定时发送心跳包，维持会话活跃。
- **音频流管理**：自动检测耳机/扬声器，发布本地音频流，获取本地/远端音量。
- **通话状态同步**：实时同步通话状态、剩余时长、AI 响应等。
- **异常与业务错误处理**：支持超时、余额不足、业务逻辑错误等多种异常处理。
- **通用回调**：支持 onDisconnected、onReconnected、onStatusUpdate、onError 等多种回调，便于业务层自定义处理。

---

## 3. 关键类型说明

- `UseXRTCProps`：传入 useCall 的回调参数类型，支持多种通话事件回调。
- `Status`：通话状态枚举（用户说话、AI 思考、AI 说话）。
- `MessageType`：信令消息类型枚举。
- `Deferred`：内部用于异步超时控制的工具类。

---

## 4. 主要逻辑流程

### 4.1 通话建立

- `makeCall({ sessionId, signalUrl })`：
  - 创建 XRTC 实例，初始化信令、日志、会话等参数。
  - 监听 connectionStateChange，处理连接、断开、重连等事件。
  - 连接成功后，发布本地音频流，自动切换耳机/扬声器。
  - 监听 message 事件，处理状态同步、剩余时长、业务错误等消息。
  - 启动本地/远端音量检测定时器。

### 4.2 心跳机制

- 组件挂载时启动心跳定时器（每秒发送一次心跳信令）。
- 组件卸载时自动清理心跳。

### 4.3 通话关闭

- `closeCall()`：
  - 发送 END 信令，清理心跳和音量定时器。
  - 等待 1 秒或收到 END_RECEIVED 消息后断开连接。

### 4.4 其他功能

- `interruptAIResponse()`：发送 INTERRUPT 信令，中断 AI 响应。
- `send()`：底层信令发送方法，支持自定义消息类型和数据。

---

## 5. 返回值说明

`useCall` 返回以下对象，供业务层使用：

- `statusData`：当前通话状态（如 AI 说话/思考/用户说话等）
- `audioLevel`：本地音量
- `remoteAudioLevel`：远端音量
- `makeCall`：发起通话方法
- `closeCall`：结束通话方法
- `interruptAIResponse`：中断 AI 响应方法
- `remainingCallDuration`：剩余通话时长
- `remainingCallDurationRef`：剩余通话时长 ref
- `send`：底层信令发送方法

---

## 6. 典型用法

```ts
const {
  statusData,
  audioLevel,
  remoteAudioLevel,
  makeCall,
  closeCall,
  interruptAIResponse,
  remainingCallDuration,
  send,
} = useCall({
  onDisconnected: ...,
  onReconnected: ...,
  onStatusUpdate: ...,
  onError: ...,
  // 其他回调
})
```

---

## 7. 重点注意事项

- **心跳和音量定时器**需在组件卸载时清理，避免内存泄漏。
- **所有回调参数**都可选，建议按需实现。
- **Deferred** 用于异步超时控制，防止通话建立卡死。
- **所有信令和状态同步**都通过 XRTC 实例完成，业务层无需关心底层细节。

---

## 8. 技术栈与依赖

- **XRTC**：自研/定制的实时音视频通信 SDK，负责底层音频流、信令、设备管理。
- **react-native-incall-manager**：管理通话时的设备状态（如扬声器、耳机、屏幕常亮等）。
- **react-native-background-timer**：保证心跳、音量检测等定时任务在 App 后台也能可靠执行。
- **react-native-device-info**：检测设备信息，如耳机是否连接。
- **Deferred**：自定义的异步超时控制工具类，防止通话建立卡死。

---

## 9. 实现难点与技术挑战

1. **实时音频流的管理与发布**

   - 需要兼容不同平台（iOS/Android）音频路由（扬声器/耳机/蓝牙）自动切换。
   - 音频流的采集、发布、订阅、断开等全流程需无缝衔接。

2. **心跳与后台定时任务**

   - React Native 原生定时器在后台会被挂起，必须用 background-timer 保证心跳和音量检测不断。
   - 心跳丢失会导致通话断线，需保证高可靠性。

3. **信令与状态同步**

   - 需要和服务端/AI 实时同步“当前说话内容”，保证 UI 展示和实际 TTS 播报完全一致。
   - 支持流式输出，UI 实时更新。

4. **异常与超时处理**

   - 通话建立、信令、音频流等环节都可能超时或失败，需有统一的超时/错误处理机制（Deferred）。
   - 业务错误（如余额不足、会员到期）需及时反馈给 UI。

5. **多回调解耦与高扩展性**

   - 支持 onDisconnected、onReconnected、onStatusUpdate、onError 等多种回调，便于业务层灵活处理。
   - 所有副作用和定时器都需在组件卸载时清理，防止内存泄漏。

6. **音量检测与动画联动**

   - 实时获取本地/远端音量，驱动 UI 动画（如语音波形、头像动画等）。

---

## 10. 面试常见问题与标准回答（FAQ）

### 1. 为什么用 RTC（XRTC/WebRTC/Agora）？

- 低延迟实时音频，信令与媒体分离，便于业务自定义。
- XRTC 支持自定义信令（如 CURRENT_STATE_UPDATE），更灵活、可控。

### 2. 信令与媒体的区别？

- 媒体承载音频流，信令负责会话建立/断开/心跳/状态同步/余额刷新/业务错误等。

### 3. NAT 穿透/ICE/STUN/TURN 有什么用？

- ICE 负责候选收集，STUN 获取公网地址，TURN 作为中继，弱网/企业内网需 TURN 保证可达。

### 4. 音频路由与设备管理怎么做？

- InCallManager 控制扬声器/耳机/蓝牙，自动切换，兼容 iOS/Android。

### 5. 如何保证“UI 文本”和 TTS 一致？

- 服务端通过 CURRENT_STATE_UPDATE 信令推送 AI 正在说的 text，前端 UI 只渲染 statusData.text，TTS 播报同一份文本，天然一致。
- 流式输出时多次下发 text，UI 实时刷新。

### 6. 连接状态与重连怎么处理？

- 监听 XRTCConnectionState，Connected/Disconnected/Reconnecting/Failed，断线清理心跳，重连回调 onReconnected。

### 7. 后台与心跳如何保证？

- 用 react-native-background-timer 保证心跳和音量检测在后台不断，卸载/断连时清理。

### 8. 异常与超时怎么兜底？

- 通话建立 Deferred 超时防卡死，业务错误（余额不足/会员到期）走 BUSINESS_LOGIC_ERROR，统一 onError 处理。

### 9. 音量检测与 UI 动画如何联动？

- 每 200ms 采样本地/远端音量，驱动语音波形/头像动画，InteractionManager 降低渲染阻塞。

### 10. 权限/打断如何处理？

- 麦克风权限失败兜底，来电/其他音频打断监听系统音频焦点。

### 11. 性能与时延优化？

- 端到端延迟优化：编解码、网络 RTT、抖动缓存，弱网降级策略。

### 12. 安全与合规？

- 传输加密（DTLS/SRTP），鉴权，录音/日志合规。

### 13. 测试与观测？

- 弱网/丢包/抖动压测，关注连接耗时、断连次数、心跳丢失、音量轨迹。

### 14. RN 实践细节？

- InteractionManager 包裹频繁 setState，清理顺序：心跳 → 音量 →XRTC→InCallManager。
- getState() 用于异步/回调/Mutation，UI 渲染用 hook 订阅。

### 15. iOS/Android 差异？

- 音频焦点/蓝牙路由 API 差异，后台保活策略、电量限制不同。

### 16. 回调设计如何解耦？

- onStatusUpdate（文本/状态）、onAlmostRunoutAlert（时长预警）、onRefreshBalance（余额刷新）、onError（业务错误）、onDisconnected/onReconnected（会话稳定性）。

---

**标准回答模版**：

> 我们用自研的 XRTC 做 RTC，媒体传输与信令分离。
> UI 文本和 TTS 一致的关键是服务端通过 CURRENT_STATE_UPDATE 推送“将要播报的文本”，前端只渲染这份 text 并同时用它做 TTS，因此保证所见即所听。
> 心跳用 BackgroundTimer 保活，连接与重连用 XRTCConnectionState 管理。
> 异常超时用 Deferred 防卡死，业务错误与系统错误分层处理。
> 设备路由由 InCallManager 控制，音量采样 200ms 驱动 UI 动画。所
> 有定时器与资源在卸载/断连时清理，确保稳定和能耗可控。

---
