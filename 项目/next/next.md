## Q1：Next.js 是什么？为什么选它？

**A**：基于 React 的全栈框架，内建路由、渲染、数据获取、打包与优化，默认最佳实践。

- 同时支持 **SSR/SSG/ISR** 与 **RSC**（Server Components）。
- 开箱即用的 **性能与 SEO** 能力（代码分割、图片优化、Metadata API）。
- 统一的 **文件路由 + 布局** 模型，降低工程复杂度。

---

## Q2：App Router vs Pages Router 的根本差异？

**A**：App Router 以 **RSC** 为核心，组件默认在服务端执行，支持布局与并行数据获取；Pages 以客户端为主。

- App：`app/` 目录、`layout.js`、`page.js`、RSC 默认、选择性水合。
- Pages：`pages/` 目录、`getServerSideProps` 等数据 API。
- 迁移策略：优先新页面用 App Router，旧页渐进迁移。

---

## Q3：RSC（React Server Components）到底解决什么？

**A**：把“无需交互的 UI”留在服务端渲染，**不下发 JS**，显著降低 Bundle 与水合成本。

- RSC 可直接在服务端读数据/调用内部服务，无需额外 API 层。
- 客户端交互区域用 `"use client"` 标注的 **Client Component** 包裹。
- 组合策略：**尽可能 Server，必要时 Client**（事件/状态/浏览器 API）。

---

## Q4：SSR / SSG / ISR 的选择与要点？

**A**：按 **时效性 × 成本**取舍：

- **SSR**：每次请求渲染，数据实时；注意缓存与边缘加速。
- **SSG**：构建期静态化，极致快；适合稳定内容。
- **ISR**：`revalidate`/按需再生，兼顾新鲜度与性能。

  **代码要点**（App Router）：

```ts
// SSR：每次请求都取新数据
await fetch(url, { cache: "no-store" });

// SSG + ISR：静态 + 周期再生
export const revalidate = 3600; // 秒
await fetch(url, { next: { revalidate: 3600 } });
```

---

## Q5：Streaming SSR 与并行数据获取怎么落地？

**A**：用 **Suspense** 将页面切片，先回首屏骨架/已就绪部分，数据到达再流式填充。

- 组件级并行 `fetch`，避免级联瀑布。
- 与 RSC 配合：服务端先拼装内容，客户端只水合交互点。

---

## Q6：Hydration 是什么？常见失败原因与修复？

**A**：把 SSR 的静态 HTML 变为可交互 React 树的过程。

- 常见失败：**服务端/客户端渲染不一致**（时间戳、随机数、环境差异）。
- 修复：在客户端用 `useEffect` 注入非确定性数据；或使用 `suppressHydrationWarning` 避免警告。
- 选择性水合：只对 `"use client"` 组件执行，RSC 本身无需水合。

---

## Q7：数据获取与缓存语义（App Router）

**A**：Next 在构建期/运行期利用 `fetch` 选项决定缓存策略。

- `cache: 'no-store'` → 强制 SSR。
- `next: { revalidate: N }` 或 `export const revalidate = N` → ISR。
- `force-cache`（默认）→ 构建或请求级静态缓存。
- **按需再生**：路由处理或后台发布时触发 revalidate（on-demand）。

---

## Q8：文件路由与布局（Nested/Group/Parallel）

**A**：目录即路由，`layout.js` 形成嵌套布局；支持路由分组与并行。

- 动态：`[id]`；可选：`[[slug]]`；捕获：`[...slug]`。
- 分组：`(group)` 不影响 URL，仅组织结构。
- 并行/拦截：`@slot`、`(..)` 进阶场景（大型应用分区渲染）。

---

## Q9：Metadata / SEO 的正确姿势？

**A**：使用 **Metadata API / generateMetadata** 输出稳定可抓取的 `<title>`/OG/JSON‑LD。

- 多语言：路由分语种 + `hreflang`；生成 **语言分 sitemap**。
- 直出关键内容（RSC/SSR），避免“空白壳 + CSR 填充”。
- 图片与字体优化：`next/image`、`preconnect/preload` 控关键资源，降低 LCP。

---

## Q10：常见坑与最佳实践

**A**：

- **混用 RSC 与浏览器 API**：浏览器 API 只能在 `"use client"` 中用。
- **水合不一致**：避免在服务端生成不稳定数据；必要时 `suppressHydrationWarning`。
- **数据瀑布**：组件级并行 `fetch` + Suspense；减少串行 await。

---

## Q11：极简示例（App Router）

```tsx
// app/blog/[id]/page.tsx  —— SSR（no-store）
export default async function Page({ params }: { params: { id: string } }) {
  const post = await fetch(process.env.API + "/posts/" + params.id, {
    cache: "no-store",
  }).then((r) => r.json());
  return <article>{post.title}</article>;
}

// app/blog/page.tsx —— SSG + ISR（1h）
export const revalidate = 3600;
export default async function List() {
  const posts = await fetch(process.env.API + "/posts", {
    next: { revalidate: 3600 },
  }).then((r) => r.json());
  return posts.map((p: any) => <div key={p.id}>{p.title}</div>);
}
```

---

## 一句话总括

**用 RSC 降 JS、用 Streaming 提首屏、用 ISR 保新鲜、用 Metadata 抓收录。**
