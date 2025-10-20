# Next.js 性能优化实践指南

## 一、Next.js 性能瓶颈分析

### 🎯 核心性能指标

- **TTFB（服务器首字节）**：受数据链路长、SSR/Server Actions 阻塞、RSC 瀑布等影响
- **LCP（最大内容绘制）**：受首屏渲染分块、图片与字体加载、流式传输与 Suspense 边界影响
- **INP（交互响应）**：受"胖客户端组件"、不必要的水合与大包体影响
- **CLS（布局偏移）**：受图片尺寸、字体回退策略、广告/推荐位懒加载策略影响

## 二、性能优化难点与解决方案

### 🚨 难点1：RSC + 数据获取瀑布，TTFB 居高不下

#### 根因分析
在 App Router 中层层 await（含 Server Actions/route handlers）导致串行数据依赖；fetch 缓存/去重策略没用好；没有对稳定数据做增量静态化（ISR/Tag）。

#### 解决方案
1. **并行化获取**（避免 RSC await 瀑布）
2. **细粒度缓存**：稳定数据打 Tag，动态失效

```typescript
import { unstable_cache } from 'next/cache';

const getHotList = unstable_cache(
  async () => fetchJSON('/hot'), 
  ['hot-list'], 
  { revalidate: 600 }
);
```

### 🚨 难点2：运行时选择（Edge vs Node）与冷启动/依赖兼容

#### 根因分析
为降延迟"盲目上 Edge"，但 Node-only 依赖或大 Bundle 使冷启动反增大。

#### 解决方案
- **延迟敏感、IO 密集、轻依赖** → `runtime = 'edge'`
- **需要 Node API/重依赖/长计算** → `runtime = 'nodejs'` 并配合预热与长连接池

### 🚨 难点3：首屏"胖水合"与包体过大，拖慢 LCP/INP

#### 根因分析
把能在服务端渲染的 UI 写成 Client Component；缺少 island 化与按需水合；next/dynamic 用得不彻底。

#### 解决方案
1. **默认 Server Component**，仅把有状态/事件部分下沉为 Client 小岛
2. **动态导入**非首屏、交互后再加载
3. **Streaming + Suspense** 输出关键内容优先

## 三、体现主动性（发现—验证—落地—守护）

### 1) 发现问题
- 建立性能预算：TTFB ≤ 300ms、LCP ≤ 2.5s、INP ≤ 200ms

### 2) 验证假设
- 预发布 A/B：Edge vs Node、ISR vs SSR 对比
- WebPageTest + Lighthouse CI：跑 20 次取 P75

### 3) 落地优化
- 重构数据层：统一 get*() 服务内部并行化 + unstable_cache
- 页面分层：Server 默认、Client 岛化、动态导入、Suspense 分块
- 运行时切分：延迟敏感改 Edge，重依赖留 Node；Node 侧做连接池与预热

### 4) 守护与回归
- 每次合并提供体积变更、TTFB LCP diff

## 四、量化成果

| 指标 | 优化前 | 优化后 | 提升 |
| --- | --- | --- | --- |
| TTFB | 1,100 ms | 220 ms | -80%（并行化 + 边缘化 + 短链路） |
| LCP | 3.8 s | 1.9 s | -50%（Streaming + Suspense + 图片/字体优化） |
| INP | 280 ms | 140 ms | -50%（Client 岛化 + 代码分割） |