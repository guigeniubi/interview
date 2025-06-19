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

## 二、Fiber 节点的数据结构

每个 Fiber 节点是一个 JS 对象，包含了如下核心属性：

```javascript
// Fiber 节点的核心属性
{
  type: Component,           // 当前节点的类型
  key: 'unique-key',        // 用于 diff 的 key
  stateNode: DOMElement,    // 对应的真实 DOM 或组件实例
  child: Fiber,             // 第一个子 Fiber
  sibling: Fiber,           // 下一个兄弟 Fiber
  return: Fiber,            // 父 Fiber
  pendingProps: {},         // 本次更新的新 props
  memoizedProps: {},        // 上一次渲染的 props
  memoizedState: {},        // 上一次渲染的 state
  effectTag: 'UPDATE',      // 本节点需要执行的副作用类型
  nextEffect: Fiber,        // 指向下一个有副作用的 Fiber
  alternate: Fiber          // 指向当前 Fiber 的"前一版本"
}
```

### 核心属性说明

- **type**：当前节点的类型（函数组件、类组件、原生标签等）
- **key**：用于 diff 的 key
- **stateNode**：对应的真实 DOM 或组件实例
- **child**：第一个子 Fiber
- **sibling**：下一个兄弟 Fiber
- **return**：父 Fiber
- **pendingProps**：本次更新的新 props
- **memoizedProps**：上一次渲染的 props
- **memoizedState**：上一次渲染的 state
- **effectTag**：本节点需要执行的副作用类型（如插入、更新、删除）
- **nextEffect**：指向下一个有副作用的 Fiber
- **alternate**：指向当前 Fiber 的"前一版本"，用于双缓冲

## 三、Fiber 的双缓冲机制（Double Buffering）

React 维护两棵 Fiber 树：

- **current 树**：当前正在显示的 UI
- **workInProgress 树**：本次更新正在构建的新 Fiber 树

每次更新时，React 会基于 current 树创建 workInProgress 树，所有变更都在 workInProgress 上进行。

提交阶段（commit phase）时，workInProgress 树会变成新的 current 树。

```javascript
// 双缓冲机制示意
let current = currentTree; // 当前显示的树
let workInProgress = workInProgressTree; // 正在构建的树

// 更新完成后
current = workInProgress; // 交换引用
```

## 四、Fiber 的调度与分片（Time Slicing）

### 1. 为什么要分片？

传统递归渲染会阻塞主线程，Fiber 通过"分片"让渲染过程可以被打断和恢复。

### 2. 调度流程

- React 会把一次更新拆分成很多小任务（每个 Fiber 节点就是一个小任务）
- 每处理完一个 Fiber 节点，React 都会检查当前帧是否还有剩余时间（通过 scheduler 或 requestIdleCallback）
- 如果时间不够，就暂停渲染，把控制权还给浏览器，等下次有空闲时间再继续

### 3. 优先级

Fiber 支持多种优先级（如同步、异步、用户输入、动画等），高优先级任务可以打断低优先级任务。

```javascript
// 优先级示例
const priorities = {
  ImmediatePriority: 1, // 立即执行
  UserBlockingPriority: 2, // 用户交互
  NormalPriority: 3, // 普通更新
  LowPriority: 4, // 低优先级
  IdlePriority: 5, // 空闲时执行
};
```

## 五、Fiber 的工作流程（详细分解）

### 1. beginWork 阶段

递归遍历 Fiber 树，为每个节点生成新的 Fiber，并计算子节点。
这个阶段可以被打断。

### 2. completeWork 阶段

自底向上归并，收集副作用（effect list）。
这个阶段也可以被打断。

### 3. commit 阶段

一旦所有 Fiber 节点都处理完，统一把副作用应用到 DOM。
这个阶段是同步、不可中断的（因为要操作真实 DOM）。

```javascript
// 工作流程示意
function performUnitOfWork(fiber) {
  // beginWork
  const nextFiber = beginWork(fiber);

  if (nextFiber) {
    return nextFiber;
  }

  // completeWork
  completeWork(fiber);

  // 继续下一个兄弟节点或返回父节点
  return fiber.sibling || fiber.return;
}
```

## 六、Fiber 的调度器（Scheduler）

React 内部有一个调度器（Scheduler），负责：

- 维护任务队列
- 分配优先级
- 判断是否需要让出主线程
- 重新调度被打断的任务

## 七、为什么 Fiber 不是树而是链表？

- 传统递归遍历树结构时，无法中断和恢复
- Fiber 用链表（child、sibling、return 指针）可以随时暂停、恢复、跳转到任意节点，灵活调度

```javascript
// 链表结构示意
fiber.child = firstChild; // 第一个子节点
fiber.sibling = nextSibling; // 下一个兄弟节点
fiber.return = parent; // 父节点
```

## 八、Fiber 带来的新特性

- **Concurrent Mode**：并发渲染，提升响应速度
- **Suspense**：异步加载组件
- **时间分片**：大任务拆小，不卡主线程
- **优先级调度**：动画、输入等高优先级任务优先执行

## 九、举个例子

假设有一个很大的列表需要渲染，Fiber 会这样做：

1. 先渲染一部分（比如前 100 个）
2. 检查主线程是否有空闲
3. 如果没有，暂停渲染，先响应用户输入
4. 等有空闲时再继续渲染剩下的部分
5. 最后一次性提交所有 DOM 变更

```javascript
// 示例：大列表渲染
function renderLargeList(items) {
  const batchSize = 100;
  let currentIndex = 0;

  function renderBatch() {
    const endIndex = Math.min(currentIndex + batchSize, items.length);

    for (let i = currentIndex; i < endIndex; i++) {
      // 渲染单个项目
      renderItem(items[i]);
    }

    currentIndex = endIndex;

    if (currentIndex < items.length) {
      // 还有更多项目，继续渲染
      requestIdleCallback(renderBatch);
    }
  }

  renderBatch();
}
```

---

> **总结**：Fiber 架构通过链表结构、双缓冲机制和时间分片，实现了可中断的渲染过程，大大提升了 React 的性能和用户体验。
