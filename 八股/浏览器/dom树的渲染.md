# DOM 树渲染流程详解

> DOM 树渲染是浏览器将 HTML 文档转换为可视化页面的核心过程，理解这个过程有助于前端性能优化。

## 目录

- [整体流程](#整体流程)
- [详细步骤](#详细步骤)
- [关键概念](#关键概念)
- [性能优化](#性能优化)

## 整体流程

```
HTML 文档 → 词法分析 → 语法分析 → DOM 树 → CSSOM 树 → 渲染树 → 布局 → 绘制
```

## 详细步骤

### 1. HTML 解析

**词法分析（Tokenization）：**

- 将 HTML 文本分解为 Token
- 识别标签、属性、文本内容
- 处理特殊字符和编码

**语法分析（Parsing）：**

- 根据 HTML 语法规则构建 DOM 树
- 处理嵌套关系和层级结构
- 解析标签属性和文本节点

**示例：**

```html
<div>
  <p>Hello <span>World</span></p>
</div>
```

**解析结果：**

```
Document
└── html
    └── body
        └── div
            └── p
                ├── text: "Hello "
                └── span
                    └── text: "World"
```

### 2. CSS 解析

**CSSOM 构建：**

- 解析 CSS 规则和选择器
- 计算样式优先级和继承关系
- 构建 CSS 对象模型树

**样式计算：**

- 应用继承的样式
- 处理层叠和优先级
- 计算最终的计算样式

**示例：**

```css
div {
  color: red;
}
p {
  font-size: 16px;
}
span {
  font-weight: bold;
}
```

### 3. 渲染树构建

**合并过程：**

- 将 DOM 树和 CSSOM 树合并
- 只包含可见元素
- 计算每个元素的最终样式

**可见性判断：**

- `display: none` 的元素不包含在渲染树中
- `visibility: hidden` 的元素包含但不显示
- 其他隐藏元素（如 `opacity: 0`）仍然包含

### 4. 布局（Layout/Reflow）

**布局计算：**

- 计算每个元素的位置和大小
- 处理盒模型、浮动、定位
- 计算相对位置和绝对位置

**布局触发：**

- 窗口大小改变
- 字体大小改变
- 添加/删除元素
- 修改元素样式

### 5. 绘制（Paint）

**绘制过程：**

- 将渲染树转换为像素
- 绘制背景、边框、文本
- 处理图层和透明度

**绘制优化：**

- 分层绘制
- 硬件加速
- 脏矩形优化

## 关键概念

### 1. 渲染阻塞

**CSS 阻塞渲染：**

- CSS 文件会阻塞 DOM 解析
- 必须等待 CSS 解析完成才能构建渲染树
- 优化：内联关键 CSS，异步加载非关键 CSS

**JavaScript 阻塞解析：**

- 同步 JavaScript 会阻塞 DOM 解析
- 优化：使用 `async` 或 `defer` 属性

### 2. 重排和重绘

**重排（Reflow）：**

- 元素位置或大小改变
- 影响其他元素的布局
- 性能消耗较大

**重绘（Repaint）：**

- 元素样式改变但不影响布局
- 只重新绘制元素
- 性能消耗相对较小

**触发重排的操作：**

```javascript
// 这些操作会触发重排
element.style.width = "100px";
element.style.height = "100px";
element.style.margin = "10px";
element.offsetWidth; // 读取布局信息
```

**触发重绘的操作：**

```javascript
// 这些操作只触发重绘
element.style.color = "red";
element.style.backgroundColor = "blue";
element.style.visibility = "hidden";
```

### 3. 渲染流水线

**现代浏览器的渲染流水线：**

```
JavaScript → Style → Layout → Paint → Composite
```

**分层合成：**

- 将页面分为多个图层
- 独立绘制和合成
- 提高渲染性能

## 性能优化

### 1. 减少重排重绘

**批量操作：**

```javascript
// 不好的做法
element.style.width = "100px";
element.style.height = "100px";
element.style.margin = "10px";

// 好的做法
element.style.cssText = "width: 100px; height: 100px; margin: 10px;";
```

**使用 transform 和 opacity：**

```javascript
// 使用 transform 代替改变位置
element.style.transform = "translateX(100px)";

// 使用 opacity 代替 visibility
element.style.opacity = "0.5";
```

### 2. 避免布局抖动

**读取和写入分离：**

```javascript
// 不好的做法
for (let i = 0; i < items.length; i++) {
  items[i].style.width = items[i].offsetWidth + 10 + "px";
}

// 好的做法
const widths = [];
for (let i = 0; i < items.length; i++) {
  widths[i] = items[i].offsetWidth;
}
for (let i = 0; i < items.length; i++) {
  items[i].style.width = widths[i] + 10 + "px";
}
```

### 3. 优化渲染性能

**使用 requestAnimationFrame：**

```javascript
function updateLayout() {
  // 在下一帧执行布局更新
  requestAnimationFrame(() => {
    element.style.width = "100px";
  });
}
```

**虚拟滚动：**

- 只渲染可见区域的元素
- 减少 DOM 节点数量
- 提高长列表性能

**CSS 优化：**

```css
/* 使用 will-change 提示浏览器优化 */
.element {
  will-change: transform;
}

/* 使用 contain 限制重排范围 */
.container {
  contain: layout style paint;
}
```

### 4. 监控渲染性能

**Performance API：**

```javascript
// 监控重排重绘
const observer = new PerformanceObserver((list) => {
  for (const entry of list.getEntries()) {
    console.log("Layout shift:", entry.value);
  }
});
observer.observe({ entryTypes: ["layout-shift"] });
```

**Chrome DevTools：**

- Performance 面板分析渲染性能
- Rendering 面板查看重排重绘
- Layers 面板查看图层信息

---

> **总结**：DOM 树渲染是一个复杂的过程，涉及 HTML 解析、CSS 计算、布局绘制等多个阶段。理解这个过程有助于我们编写高性能的前端代码，避免不必要的重排重绘。
