# React Hooks 详解

> React Hooks 是 React 16.8 引入的新特性，让函数组件也能使用状态和其他 React 特性。

## 目录

- [1. useEffect 执行时机](#1-useeffect-执行时机)
- [2. useLayoutEffect vs useEffect](#2-uselayouteffect-vs-useeffect)
- [3. useLayoutEffect 使用场景](#3-uselayouteffect-使用场景)

## 1. useEffect 执行时机

### 为什么 useEffect 不在渲染阶段执行？

**原因**：保证渲染的纯净性和可预测性。

渲染阶段（render phase）要求是纯函数，不能有副作用（如 DOM 操作、数据请求、定时器等）。

如果在渲染阶段执行副作用，会导致：

- 渲染结果不确定（副作用可能影响渲染逻辑）
- 并发模式下，渲染可能被多次执行、打断、丢弃，副作用会重复或失效，产生 bug

所以 React 设计为：**useEffect 只在 DOM 更新并绘制到屏幕后才执行**，这样副作用不会影响渲染本身。

```javascript
// 正确的 useEffect 使用方式
useEffect(() => {
  // 副作用代码：数据请求、DOM 操作、定时器等
  fetch("/api/data").then(setData);

  return () => {
    // 清理函数
    clearTimeout(timer);
  };
}, [dependencies]);
```

## 2. useLayoutEffect vs useEffect

| 特性             | useLayoutEffect              | useEffect                      |
| ---------------- | ---------------------------- | ------------------------------ |
| **执行时机**     | DOM 变更后、绘制前（同步）   | DOM 变更后、绘制后（异步）     |
| **是否阻塞绘制** | 是（会阻塞浏览器绘制）       | 否（不会阻塞浏览器绘制）       |
| **适合场景**     | 需要同步读取/修改 DOM 的场景 | 绝大多数副作用（如请求、订阅） |
| **性能影响**     | 可能影响渲染流畅性           | 性能更好，对用户更友好         |

### 详细解释

#### useLayoutEffect

在 DOM 更新后、浏览器绘制前**同步执行**。如果你需要立即读取布局信息（如元素尺寸、位置）或同步修改 DOM，必须用它，否则会有"闪烁"。

```javascript
useLayoutEffect(() => {
  // 同步读取 DOM 信息
  const element = document.getElementById("my-element");
  const rect = element.getBoundingClientRect();

  // 同步修改 DOM
  element.style.width = `${rect.width}px`;
}, []);
```

#### useEffect

在 DOM 更新后、浏览器绘制后**异步执行**。适合大多数副作用，如数据请求、事件监听、定时器等。

```javascript
useEffect(() => {
  // 异步副作用
  const timer = setTimeout(() => {
    console.log("异步执行");
  }, 1000);

  return () => clearTimeout(timer);
}, []);
```

## 3. useLayoutEffect 使用场景

### 什么时候选择 useLayoutEffect？

**典型场景**：

1. **需要同步读取 DOM 信息**

   - 获取元素宽高、滚动位置
   - 计算布局相关的尺寸

2. **需要同步修改 DOM**

   - 手动设置样式
   - 调整滚动条位置
   - 防止页面闪烁

3. **需要保证副作用在浏览器绘制前完成**
   - 避免页面闪烁
   - 确保视觉一致性

### 实际示例

```javascript
// 示例：防止闪烁的模态框
function Modal({ isOpen, children }) {
  const modalRef = useRef(null);

  useLayoutEffect(() => {
    if (isOpen && modalRef.current) {
      // 同步计算和设置位置，避免闪烁
      const rect = modalRef.current.getBoundingClientRect();
      const centerX = (window.innerWidth - rect.width) / 2;
      const centerY = (window.innerHeight - rect.height) / 2;

      modalRef.current.style.left = `${centerX}px`;
      modalRef.current.style.top = `${centerY}px`;
    }
  }, [isOpen]);

  return (
    <div ref={modalRef} className="modal">
      {children}
    </div>
  );
}
```

```javascript
// 示例：同步滚动位置
function ScrollToTop() {
  useLayoutEffect(() => {
    // 同步滚动到顶部，避免用户看到滚动过程
    window.scrollTo(0, 0);
  }, []);

  return null;
}
```

### 性能考虑

```javascript
// 避免在 useLayoutEffect 中执行耗时操作
useLayoutEffect(() => {
  // ❌ 错误：耗时操作会阻塞绘制
  const result = expensiveCalculation();

  // ✅ 正确：只做必要的 DOM 操作
  element.style.transform = `translateX(${offset}px)`;
}, [offset]);
```

---

> **总结**：useEffect 用于大多数副作用场景，useLayoutEffect 用于需要同步 DOM 操作的场景。选择哪个取决于是否需要阻塞浏览器绘制。
