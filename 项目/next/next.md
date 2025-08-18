# Next.js 简介

## 1. 什么是 Next.js

Next.js 是一个基于 React 的**全栈框架**，提供了生产级的功能和优化，简化了 React 应用的开发和部署。

### 核心特性

- **服务端渲染 (SSR)**：提升首屏加载速度和 SEO
- **静态生成 (SSG)**：构建时预渲染页面
- **API 路由**：内置后端 API 支持
- **自动代码分割**：按需加载，优化性能

## 2. 渲染模式

### SSR (Server-Side Rendering) - App Router 方式

```javascript
// 数据获取函数可以写在组件外面
async function fetchPost(id) {
  const res = await fetch(`/api/posts/${id}`, {
    cache: "no-store", // 每次都重新获取（SSR）
  });
  return res.json();
}

// app/blog/[id]/page.js
async function BlogPost({ params }) {
  const post = await fetchPost(params.id);
  return <article>{post.content}</article>;
}

export default BlogPost;
```

### SSG (Static Site Generation) - App Router 方式

```javascript
// 数据获取函数写在外面，便于复用
async function fetchPosts() {
  const res = await fetch("/api/posts", {
    cache: "force-cache", // 静态生成时缓存
  });
  return res.json();
}

// app/blog/page.js
async function BlogList() {
  const posts = await fetchPosts();

  return (
    <div>
      {posts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  );
}

// 启用ISR (增量静态再生)
export const revalidate = 3600; // 1小时后重新生成

export default BlogList;
```

## 3. 核心功能

### 动态路由

```
pages/
  index.js        → /
  about.js        → /about
  blog/
    index.js      → /blog
    [id].js       → /blog/:id
    [...slug].js  → /blog/a/b/c
```

### API 路由

API 路由就是创建后端接口，让前端可以请求数据。

**简单理解**：

- 创建文件 `pages/api/users.js`
- 自动变成接口 `/api/users`
- 前端可以通过 `fetch('/api/users')` 调用

```javascript
// pages/api/users.js - 创建一个获取用户列表的接口
export default function handler(req, res) {
  // GET请求：获取数据
  if (req.method === "GET") {
    res.status(200).json({
      users: [
        { id: 1, name: "张三" },
        { id: 2, name: "李四" },
      ],
    });
  }

  // POST请求：创建数据
  if (req.method === "POST") {
    const newUser = req.body;
    // 保存到数据库...
    res.status(201).json({ message: "用户创建成功" });
  }
}
```

**前端调用**：

```javascript
// 获取用户列表
const users = await fetch("/api/users").then((r) => r.json());

// 创建新用户
await fetch("/api/users", {
  method: "POST",
  body: JSON.stringify({ name: "王五" }),
});
```

## 4. App Router (Next.js 13+)

### 为什么要用 App Router？

## React Server Components (RSC) 原生支持

- 组件默认在服务端运行，零 JavaScript 发送到客户端
- 直接访问数据库和文件系统，无需 API 层
- 减少客户端 Bundle 大小，提升性能

## 嵌套布局 (Nested Layouts)

- 支持多层嵌套布局，布局可以共享和复用
- 页面切换时局部刷新 (Partial Rendering)
- 不必重新渲染整个布局，只更新变化部分

## 内置 UI 状态支持

- **Loading UI**：`loading.js` 自动显示加载状态
- **Error UI**：`error.js` 自动处理错误边界
- **NotFound UI**：`not-found.js` 自定义 404 页面

## 现代数据获取方式

- **fetch + async/await**：直接在 Server Component 中获取数据替代了 page Router 的 getServerSideProps
- **Streaming SSR**：配合 Suspense 实现流式渲染
- **并行数据获取**：组件级别独立获取，提升性能

## File-based routing 更灵活

- **动态路由**：`[id]` 参数路由
- **嵌套路由**：文件夹结构即路由结构
- **平铺组合**：`(group)` 路由分组，不影响 URL 结构

### 3. 混合渲染策略

```javascript
// 服务端组件（默认）
async function ServerComponent() {
  const data = await fetchData();
  return <div>{data.title}</div>;
}

// 客户端组件（按需）
("use client");
import { useState } from "react";

function ClientComponent() {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount(count + 1)}>{count}</button>;
}
```

### 核心价值

✅ **更小的客户端 Bundle**：服务端组件不会打包到客户端

✅ **更好的 SEO**：更多内容在服务端渲染

✅ **更快的首屏加载**：减少客户端 JavaScript 执行

✅ **更灵活的架构**：组件级别的数据获取和渲染策略

✅ **更好的开发体验**：布局系统、错误边界、加载状态等开箱即用

## 5. 水合 (Hydration) 概念

### 什么是水合？

水合是指**将服务端渲染的静态 HTML 转换为可交互的 React 组件**的过程。

### 水合过程

```
1. 服务端渲染 → 生成静态HTML
2. 浏览器接收 → 显示静态内容
3. JavaScript加载 → 开始水合
4. 水合完成 → 页面可交互
```

### 水合问题

```javascript
// 服务端渲染时间
const serverTime = new Date().toISOString();

// 客户端水合时间（不同！）
const clientTime = new Date().toISOString();

// 会导致水合失败：服务端和客户端内容不匹配
```

## Server Component vs Client Component 渲染流程

### Server Component (服务端组件)

```javascript
// app/posts/page.js - 默认是 Server Component
async function PostList() {
  const posts = await fetch("/api/posts").then((r) => r.json());

  return (
    <div>
      {posts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  );
}
```

**渲染流程**：

1. **服务端执行**：组件在服务器运行，获取数据
2. **生成 HTML**：直接渲染成静态 HTML 字符串
3. **发送到浏览器**：HTML 包含完整内容
4. **无需水合**：静态内容，不需要 JavaScript

### Client Component (客户端组件)

```javascript
// app/components/Counter.js
"use client"; // 标记为客户端组件

import { useState } from "react";

function Counter() {
  const [count, setCount] = useState(0);

  return <button onClick={() => setCount(count + 1)}>点击次数: {count}</button>;
}
```

**渲染流程**：

1. **服务端预渲染**：生成初始 HTML 结构
2. **发送到浏览器**：HTML + JavaScript 代码
3. **JavaScript 加载**：浏览器下载组件代码
4. **水合过程**：JavaScript 接管 DOM，绑定事件
5. **变为可交互**：用户可以点击按钮

### 混合渲染示例

```javascript
// app/blog/page.js
async function BlogPage() {
  const posts = await fetchPosts(); // Server Component 获取数据

  return (
    <div>
      <h1>博客列表</h1>
      {/* Server Component - 静态内容 */}
      <PostList posts={posts} />

      {/* Client Component - 交互功能 */}
      <SearchBox />
      <LikeButton />
    </div>
  );
}

// 只有 SearchBox 和 LikeButton 需要水合
```

### 水合过程详解

**传统 SSR（所有组件都需要水合）**：

```
服务端: 渲染整个页面 → HTML
浏览器: 显示HTML → 下载全部JS → 水合整个页面 → 可交互
```

**App Router（选择性水合）**：

```
服务端:
  - Server Component → 静态HTML（无需JS）
  - Client Component → HTML结构 + 标记

浏览器:
  - 显示完整HTML
  - 只下载Client Component的JS
  - 只水合需要交互的部分
  - 其他部分保持静态
```

### 性能对比

| 组件类型         | Bundle 大小 | 水合时间 | 交互性   |
| ---------------- | ----------- | -------- | -------- |
| Server Component | 0KB         | 无需水合 | 静态内容 |
| Client Component | 包含 JS     | 需要水合 | 可交互   |

**核心优势**：

- **更小的 Bundle**：Server Component 不打包到客户端
- **更快的水合**：只水合真正需要交互的组件
- **更好的性能**：减少 JavaScript 执行时间
