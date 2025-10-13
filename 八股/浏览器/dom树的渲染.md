# 🌐 浏览器渲染面试脉络

> **一句话记忆：**  
> 浏览器多进程协同，把 HTML/CSS/JS 变成屏幕像素：获取资源 → 解析构建树 → 布局 → 绘制 → 合成 → 显示。

---

## 1. 多进程结构（常被问）

- **Browser Process（浏览器进程）**：协调调度、负责 UI、进程管理、权限隔离。
- **Network Process（网络进程）**：处理请求、缓存、重定向，常驻。
- **Renderer Process（渲染进程）**：每个 Tab 一个沙箱，核心在这里完成 DOM/CSSOM/JS/布局/绘制。
- **GPU Process（GPU 进程）**：负责合成后的图层栅格化、提交给 GPU 驱动。
- 关键线程：渲染进程内的 **Main Thread**（解析与布局）、**Compositor Thread**（合成）、**Raster Thread**（栅格）、必要时还有 **Worker** 与 **IO Thread**。

---

## 2. 渲染主流程（Renderer 视角）

```
网络进程传输字节 → 渲染进程主线程解析
HTML → DOM
CSS → CSSOM
DOM + CSSOM → Render Tree
Render Tree → Layout（布局树）
Layout → Paint（绘制指令）
绘制指令 → Layer 栅格化 → 合成器线程提交 GPU → 屏幕
```

### 2.1 HTML 解析（DOM 构建）

- 词法分析生成 Token，建立 DOM 节点树。
- **阻塞点**：同步 `<script>` 会暂停解析（主线程串行）；放在底部或用 `defer/async`。

### 2.2 CSS 解析（CSSOM 构建）

- 解析选择器、计算优先级/继承，生成 CSSOM。
- **阻塞点**：CSS 没解析完，渲染树无法生成 → 通常内联关键 CSS + 延迟非关键 CSS。

### 3️⃣ 合成渲染树（Render Tree）

- 合并 DOM + CSSOM
- 只包含可见节点（`display:none` 不参与）

---

### 2.4 布局（Layout / Reflow）

- 计算几何信息（位置、尺寸、字体等）。
- 触发点：DOM 结构变化、添加/删除元素、`offsetWidth` 等强制同步布局、窗口 resize。

### 2.5 绘制（Paint）

- 生成绘制列表：背景、边框、文字、阴影。
- 视觉属性变化（颜色、阴影）触发 Repaint。

### 2.6 合成（Composite）

- 主线程把树拆成图层，提交给合成器线程。
- 合成器线程调度栅格线程（GPU or CPU）把图层栅格化成位图，再提交 GPU 进程显示。
- 动画如果只改合成属性（`transform`、`opacity`），可绕开主线程，大幅减轻卡顿。

---

## 3. 高频考点速记

- **渲染阻塞**：CSS 阻塞 render tree，JS 阻塞 DOM 解析。
- **Critical Rendering Path（CRP）**：网络 → 解析 → 样式 → 布局 → 绘制 → 合成。
- **Reflow vs Repaint**：结构/几何变化触发 Reflow，视觉变化触发 Repaint，合成层属性只走 Composite。
- **强制同步布局**：读取布局信息立即触发 Layout，如 `offsetHeight`；要批量读写分离。
- **Layer Promotion**：`will-change`、`transform`、`opacity` 可以提层，滥用会增加内存。
- **输入响应**：合成器线程可直接处理合成层动画（如 transform），离线手势避免主线程卡顿。

---

## 4. 性能优化备忘

- **阻塞优化**：`defer`、`async`、按需加载 JS；关键 CSS 内联。
- **重排控制**：合并 DOM 操作、文档片段、`requestAnimationFrame` 调度动画。
- **合成加速**：使用合成属性制作过渡；提前声明 `will-change`，动画结束及时回收。
- **资源优化**：压缩 HTML/CSS/JS，合理分片，HTTP/2+缓存。
- **长列表**：虚拟列表、IntersectionObserver 懒加载。

---

## 5. 面试输出模板（带进程视角）

> Chrome 等现代浏览器采用多进程架构：浏览器进程负责协调，网络进程拉取资源，渲染进程沙箱内的主线程解析 HTML/CSS 构建 DOM、CSSOM，生成渲染树后做布局和绘制；绘制列表交给合成器线程拆层，栅格线程（依赖 GPU 进程）生成位图并最终显示。  
> 渲染的关键阻塞点在同步脚本和 CSS，性能关注重排/重绘、强制同步布局，善用合成层（transform/opacity）和 requestAnimationFrame 让动画走合成线程。
