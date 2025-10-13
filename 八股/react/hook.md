### Q1: Hook 出现的原因是什么？

**A:** Hook 主要解决了以下问题：

1. **状态逻辑复用困难**：类组件中状态逻辑难以在组件间复用
2. **组件变得复杂**：生命周期方法中逻辑分散，相关逻辑无法聚合
3. **类组件的痛点**：this 绑定、学习成本高、代码冗余

### Hooks 链表与 Fiber 的关系

在 React 中，函数组件的 hooks（如 useState、useEffect 等）其实是以链表的形式挂载在对应的 fiber 节点上的。每次组件渲染时，React 会遍历 hooks 链表，依次执行每个 hook 的逻辑。

#### 1. Hooks 链表

每个 fiber 节点有一个 `memoizedState` 属性，指向 hooks 链表的第一个节点。每个 hook 节点有一个 `next` 指针，指向下一个 hook。

#### 2. Hooks 执行顺序的重要性

**为什么 Hooks 必须在函数组件的顶层调用？**

因为 React 依赖 hooks 的调用顺序来识别和更新每个 hook 的状态。如果 hooks 在条件语句、循环或嵌套函数中调用，会导致 hooks 的调用顺序发生变化，从而破坏链表结构。

#### 3. Hooks 链表的工作原理

**首次渲染时：**

1. 创建 hooks 链表，每个 hook 按调用顺序添加到链表中
2. 初始化每个 hook 的状态
3. 将链表头节点赋值给 fiber.memoizedState

**更新渲染时：**

1. 从 fiber.memoizedState 开始遍历 hooks 链表
2. 按顺序执行每个 hook 的逻辑
3. 更新 hook 的状态和副作用

**Q: 为什么不能在条件语句中使用 Hooks？**

A: 因为 React 使用 hooks 的调用顺序来识别和更新状态。如果 hooks 在条件语句中调用，会导致：

- 首次渲染和更新渲染时 hooks 的调用顺序不一致
- hooks 链表结构被破坏
- 状态错乱，可能导致 bug

**Q: 为什么 Hooks 只能在函数组件中使用？**

A: 因为 hooks 需要挂载到 fiber 节点上，而只有函数组件对应的 fiber 节点才有 `memoizedState` 属性来存储 hooks 链表。类组件使用 `instance` 属性存储状态。

**Q: 多个 useState 如何区分？**

A: React 通过 hooks 的调用顺序来区分。每个 useState 在 hooks 链表中的位置是固定的，React 根据这个位置来获取和更新对应的状态。

**Q: useEffect 的依赖数组是如何工作的？**

A: React 会将依赖数组存储在 hook 的 `deps` 属性中。每次渲染时，会比较新的依赖数组和上一次的依赖数组，如果发生变化，就执行 effect 的清理函数和新的 effect 函数。

---

> **总结**：Fiber 架构通过链表结构、双缓冲机制和时间分片，实现了可中断的渲染过程，大大提升了 React 的性能和用户体验。
