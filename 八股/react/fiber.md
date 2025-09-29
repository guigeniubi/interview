# React Fiber 详解

> React Fiber 是 React 16 引入的新架构，用于重写协调过程，实现可中断的渲染和更好的用户体验。

## 目录

- [一、Fiber 的本质](#一fiber-的本质是什么)
- [二、Fiber 节点的数据结构](#二fiber-节点的数据结构)
- [三、Fiber 的双缓冲机制](#三fiber-的双缓冲机制double-buffering)
- [四、Fiber 的调度与分片](#四fiber-的调度与分片time-slicing)
- [五、Fiber 的工作流程](#五fiber-的工作流程详细分解)
- [六、Fiber 的调度器](#六fiber-的调度器scheduler)
- [七、为什么 Fiber 不是树而是链表](#七为什么-fiber-不是树而是链表)
- [八、Fiber 带来的新特性](#八fiber-带来的新特性)
- [九、举个例子](#九举个例子)

## 一、Fiber 的本质是什么？

Fiber 是 React 16 之后用来重写协调（Reconciliation）过程的数据结构和调度机制。

本质上，Fiber 是一种链表结构（而不是树），每个 Fiber 节点代表组件树中的一个节点。

## 二、Fiber 的双缓冲机制（Double Buffering）

React 维护两棵 Fiber 树：

- **current 树**：当前正在显示的 UI
- **workInProgress 树**：本次更新正在构建的新 Fiber 树

每次更新时，React 会基于 current 树创建 workInProgress 树，所有变更都在 workInProgress 上进行。

提交阶段（commit phase）时，workInProgress 树会变成新的 current 树。

## 三、Fiber 的调度与分片（Time Slicing）

### 1. 为什么要分片？

传统递归渲染会阻塞主线程，Fiber 通过"分片"让渲染过程可以被打断和恢复。

### 2. 调度流程

- React 会把一次更新拆分成很多小任务（每个 Fiber 节点就是一个小任务）
- 每处理完一个 Fiber 节点，React 都会检查当前帧是否还有剩余时间（通过 scheduler 或 requestIdleCallback）
- 如果时间不够，就暂停渲染，把控制权还给浏览器，等下次有空闲时间再继续

### 3. 优先级

Fiber 支持多种优先级（如同步、异步、用户输入、动画等），高优先级任务可以打断低优先级任务。
React 之前是 ExpirationTime，17 之后是 Lane 模型，本质是一个位掩码

## 五、Fiber 的工作流程（详细分解）

### 1. beginWork 阶段

递归遍历 Fiber 树，为每个节点生成新的 Fiber，并计算子节点。
这个阶段可以被打断。

### 2. completeWork 阶段

自底向上归并，收集副作用（effect list）。
这个阶段也可以被打断。

### 3. commit 阶段

一旦所有 Fiber 节点都处理完，统一把副作用应用到 DOM。
这个阶段是同步、不可中断的（因为要操作真实 DOM）。要不然用户看到的会不一致。

## 七、为什么 Fiber 不是树而是链表？

- 传统递归遍历树结构时，无法中断和恢复
- Fiber 用链表（child、sibling、return 指针）可以随时暂停、恢复、跳转到任意节点，灵活调度

### 十、Hooks 链表与 Fiber 的关系

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
