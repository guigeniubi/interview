# Next.js 性能优化实践指南

## 一、构建阶段优化

1. **开启 SWC 编译器优化**

   - SWC 是 Rust 编写的编译器，比 Babel 更快：
     ```js
     // next.config.js
     const nextConfig = {
       swcMinify: true,
     };
     module.exports = nextConfig;
     ```
   - 可显著提升打包速度和构建性能。

2. **Bundle Analyzer**

   - 使用 `next-bundle-analyzer` 检查打包体积：
     ```bash
     npm install @next/bundle-analyzer
     ```
     ```js
     const withBundleAnalyzer = require("@next/bundle-analyzer")({
       enabled: process.env.ANALYZE === "true",
     });
     module.exports = withBundleAnalyzer({});
     ```

3. **动态导入组件**
   - 使用 `next/dynamic` 懒加载非首屏组件：
     ```tsx
     import dynamic from "next/dynamic";
     const HeavyChart = dynamic(() => import("../components/HeavyChart"), {
       ssr: false,
     });
     ```

---

## 二、请求与渲染优化

1. **使用 Edge Runtime**

   - 将 SSR 逻辑运行在 Edge Function：
     ```ts
     export const runtime = "edge";
     export default async function handler(req: Request) {
       return new Response("Hello from Edge!");
     }
     ```

2. **流式 SSR（Streaming SSR）**

   - 利用 `React 18` 的流式渲染：
     ```tsx
     import { renderToReadableStream } from "react-dom/server";
     ```
   - 优势：首屏更快、TTFB 降低。

3. **利用 ISR 提升性能**
   - 按需再生成页面：
     ```ts
     export async function getStaticProps() {
       return { props: {}, revalidate: 60 }; // 每 60 秒再生
     }
     ```

---

## 三、静态资源与缓存优化

1. **图片优化**

   - `next/image` 默认懒加载、自动生成多尺寸；
   - 启用 CDN 或 Vercel Image Optimization。

2. **字体优化**

   - 使用 `next/font` 内联字体，减少网络请求：
     ```tsx
     import { Inter } from "next/font/google";
     const inter = Inter({ subsets: ["latin"] });
     ```

3. **缓存策略**
   - 使用 `stale-while-revalidate`：
     ```js
     res.setHeader(
       "Cache-Control",
       "public, s-maxage=60, stale-while-revalidate=300"
     );
     ```

---

## 四、客户端交互与渲染优化

1. **减少不必要的重渲染**

   - 使用 `React.memo`、`useMemo`、`useCallback`；
   - 避免全局状态频繁触发渲染。

2. **启用并发特性**

   - 使用 `useTransition` 优化交互流畅度；
   - 结合 Suspense 提升加载体验。

3. **懒加载与骨架屏**
   - 对图表、列表、评论区使用懒加载；
   - 首屏 Skeleton 预占位，减少视觉抖动。

---

## 五、SEO 与 Web Vitals 优化

1. **Meta 与结构化数据**

   - 动态注入 title、description、OG 标签；
   - 添加 JSON-LD 结构化数据提高爬虫识别。

2. **减少 CLS 与 LCP**

   - 图片、广告位提前预留空间；
   - 首屏主内容使用 SSR 或 Streaming SSR。

3. **监控关键指标**
   - 通过 `Next.js Analytics` 或 `Web Vitals` 监控：
     ```tsx
     export function reportWebVitals(metric) {
       console.log(metric);
     }
     ```

---

## 六、生产部署与监控

- 使用 **Vercel Edge Network** 提升全球访问速度；
- 启用 gzip 或 brotli 压缩；
- 集成 Sentry / Datadog / LogRocket 进行性能监控；
- 利用 CDN 缓存 HTML 与静态资源；
- 定期运行 Lighthouse 检查性能指标。

---

## ✅ 总结

Next.js 性能优化可以分为以下五个维度：

1. **构建阶段优化**（SWC、动态导入、Bundle 分析）；
2. **渲染优化**（Edge、Streaming、ISR）；
3. **静态资源优化**（图片、字体、缓存策略）；
4. **交互优化**（Suspense、useTransition、懒加载）；
5. **SEO 与监控**（结构化数据、CLS、WebVitals）。

目标：**首屏更快、交互更顺、全球更稳、可持续监控。**
