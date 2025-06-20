# React Key 从虚拟 DOM 角度的原理解析

> React Key 的核心作用在于优化虚拟 DOM 的 Diff 算法，通过唯一标识符帮助 React 快速识别和复用 DOM 节点。

## 虚拟 DOM 中的 Key 机制

### 1. 没有 Key 时的 Diff 过程

```javascript
// 初始虚拟 DOM
const oldVDOM = [
  { type: "li", props: { children: "Apple" } },
  { type: "li", props: { children: "Banana" } },
  { type: "li", props: { children: "Orange" } },
];

// 更新后的虚拟 DOM（删除第一个元素）
const newVDOM = [
  { type: "li", props: { children: "Banana" } },
  { type: "li", props: { children: "Orange" } },
];

// React 的 Diff 过程（简化版）
function diffWithoutKey(oldChildren, newChildren) {
  const updates = [];

  // 按索引位置比较
  for (let i = 0; i < Math.min(oldChildren.length, newChildren.length); i++) {
    const oldChild = oldChildren[i];
    const newChild = newChildren[i];

    if (oldChild.type !== newChild.type) {
      // 类型不同，替换整个节点
      updates.push({ type: "REPLACE", index: i, newNode: newChild });
    } else if (oldChild.props.children !== newChild.props.children) {
      // 内容不同，更新文本内容
      updates.push({
        type: "UPDATE_TEXT",
        index: i,
        newText: newChild.props.children,
      });
    }
  }

  // 处理新增和删除
  if (newChildren.length > oldChildren.length) {
    // 新增节点
    for (let i = oldChildren.length; i < newChildren.length; i++) {
      updates.push({ type: "INSERT", index: i, newNode: newChildren[i] });
    }
  } else if (oldChildren.length > newChildren.length) {
    // 删除节点
    for (let i = newChildren.length; i < oldChildren.length; i++) {
      updates.push({ type: "DELETE", index: i });
    }
  }

  return updates;
}

// 结果：React 会认为需要更新所有节点
// 1. 将 'Apple' 更新为 'Banana'（错误）
// 2. 将 'Banana' 更新为 'Orange'（错误）
// 3. 删除 'Orange'（错误）
```

### 2. 有 Key 时的 Diff 过程

```javascript
// 初始虚拟 DOM（带 Key）
const oldVDOM = [
  { type: "li", key: "apple", props: { children: "Apple" } },
  { type: "li", key: "banana", props: { children: "Banana" } },
  { type: "li", key: "orange", props: { children: "Orange" } },
];

// 更新后的虚拟 DOM（删除第一个元素）
const newVDOM = [
  { type: "li", key: "banana", props: { children: "Banana" } },
  { type: "li", key: "orange", props: { children: "Orange" } },
];

// React 的 Diff 过程（带 Key）
function diffWithKey(oldChildren, newChildren) {
  const updates = [];
  const keyMap = new Map();

  // 构建旧节点的 key 映射
  oldChildren.forEach((child, index) => {
    if (child.key) {
      keyMap.set(child.key, { child, index });
    }
  });

  // 根据 key 匹配节点
  newChildren.forEach((newChild, newIndex) => {
    const oldNodeInfo = keyMap.get(newChild.key);

    if (oldNodeInfo) {
      // 找到匹配的旧节点
      const { child: oldChild, index: oldIndex } = oldNodeInfo;

      if (oldIndex !== newIndex) {
        // 位置发生变化，移动节点
        updates.push({
          type: "MOVE",
          fromIndex: oldIndex,
          toIndex: newIndex,
          key: newChild.key,
        });
      } else if (oldChild.props.children !== newChild.props.children) {
        // 内容发生变化，更新内容
        updates.push({
          type: "UPDATE_TEXT",
          index: newIndex,
          newText: newChild.props.children,
        });
      }

      // 从映射中移除已处理的节点
      keyMap.delete(newChild.key);
    } else {
      // 新节点，插入
      updates.push({ type: "INSERT", index: newIndex, newNode: newChild });
    }
  });

  // 剩余的旧节点需要删除
  keyMap.forEach(({ index }) => {
    updates.push({ type: "DELETE", index });
  });

  return updates;
}

// 结果：React 会精确地只删除 'apple' 节点
// 1. 删除 key 为 'apple' 的节点
// 2. 其他节点保持不变（复用 DOM）
```

## Fiber 节点中的 Key 处理

### 1. Fiber 节点的 Key 属性

```javascript
// Fiber 节点结构（简化）
interface Fiber {
  key: string | null; // 节点的唯一标识
  type: any; // 节点类型
  props: any; // 节点属性
  return: Fiber | null; // 父节点
  child: Fiber | null; // 第一个子节点
  sibling: Fiber | null; // 下一个兄弟节点
  alternate: Fiber | null; // 对应的旧 Fiber 节点
  // ... 其他属性
}

// React 内部处理 key 的逻辑
function reconcileChildrenArray(returnFiber, currentFirstChild, newChildren) {
  let oldFiber = currentFirstChild;
  let newFiber = null;
  let lastPlacedIndex = 0;

  // 构建 key 到 Fiber 的映射
  const existingChildren = new Map();
  let existingChild = oldFiber;

  while (existingChild) {
    const key =
      existingChild.key !== null ? existingChild.key : existingChild.index;
    existingChildren.set(key, existingChild);
    existingChild = existingChild.sibling;
  }

  // 处理新的子节点
  for (let i = 0; i < newChildren.length; i++) {
    const newChild = newChildren[i];
    const newKey = newChild.key !== null ? newChild.key : i;

    const existingChild = existingChildren.get(newKey);

    if (existingChild) {
      // 找到匹配的旧 Fiber，复用
      newFiber = updateElement(returnFiber, existingChild, newChild);
      existingChildren.delete(newKey);

      // 检查是否需要移动
      if (existingChild.index < lastPlacedIndex) {
        newFiber.effectTag = Placement;
      } else {
        lastPlacedIndex = existingChild.index;
      }
    } else {
      // 没有匹配的旧 Fiber，创建新的
      newFiber = createElement(returnFiber, newChild);
    }

    // 链接 Fiber 节点
    if (i === 0) {
      returnFiber.child = newFiber;
    } else {
      previousNewFiber.sibling = newFiber;
    }
    previousNewFiber = newFiber;
  }

  // 删除剩余的旧 Fiber
  existingChildren.forEach((child) => {
    child.effectTag = Deletion;
  });
}
```

### 2. Key 在 Diff 算法中的优化

```javascript
// 没有 key 时的 O(n²) 算法
function diffWithoutKeyOptimization(oldChildren, newChildren) {
  const updates = [];

  // 每个新节点都要与所有旧节点比较
  for (let i = 0; i < newChildren.length; i++) {
    let found = false;
    for (let j = 0; j < oldChildren.length; j++) {
      if (newChildren[i].type === oldChildren[j].type) {
        // 找到匹配，但可能不是最优匹配
        updates.push({ type: "UPDATE", fromIndex: j, toIndex: i });
        found = true;
        break;
      }
    }
    if (!found) {
      updates.push({ type: "INSERT", index: i });
    }
  }

  return updates; // 时间复杂度 O(n²)
}

// 有 key 时的 O(n) 算法
function diffWithKeyOptimization(oldChildren, newChildren) {
  const updates = [];
  const keyMap = new Map();

  // 构建 key 映射 O(n)
  oldChildren.forEach((child, index) => {
    keyMap.set(child.key, { child, index });
  });

  // 根据 key 匹配 O(n)
  newChildren.forEach((newChild, newIndex) => {
    const oldNodeInfo = keyMap.get(newChild.key);

    if (oldNodeInfo) {
      updates.push({
        type: "MOVE",
        fromIndex: oldNodeInfo.index,
        toIndex: newIndex,
      });
      keyMap.delete(newChild.key);
    } else {
      updates.push({ type: "INSERT", index: newIndex });
    }
  });

  // 删除剩余节点 O(n)
  keyMap.forEach(({ index }) => {
    updates.push({ type: "DELETE", index });
  });

  return updates; // 时间复杂度 O(n)
}
```

## 实际应用示例

### 1. 列表重新排序

```javascript
// 初始状态
const initialItems = [
  { id: 1, text: "Item 1" },
  { id: 2, text: "Item 2" },
  { id: 3, text: "Item 3" },
];

// 重新排序后
const reorderedItems = [
  { id: 3, text: "Item 3" },
  { id: 1, text: "Item 1" },
  { id: 2, text: "Item 2" },
];

// 虚拟 DOM 变化过程
const oldVDOM = [
  { key: 1, type: "li", props: { children: "Item 1" } },
  { key: 2, type: "li", props: { children: "Item 2" } },
  { key: 3, type: "li", props: { children: "Item 3" } },
];

const newVDOM = [
  { key: 3, type: "li", props: { children: "Item 3" } },
  { key: 1, type: "li", props: { children: "Item 1" } },
  { key: 2, type: "li", props: { children: "Item 2" } },
];

// Diff 结果：只需要移动 DOM 节点，不需要重新创建
// 1. 移动 key=3 的节点到位置 0
// 2. 移动 key=1 的节点到位置 1
// 3. 移动 key=2 的节点到位置 2
```

### 2. 列表项删除

```javascript
// 删除中间项的情况
const oldVDOM = [
  { key: 1, type: "li", props: { children: "Item 1" } },
  { key: 2, type: "li", props: { children: "Item 2" } },
  { key: 3, type: "li", props: { children: "Item 3" } },
];

const newVDOM = [
  { key: 1, type: "li", props: { children: "Item 1" } },
  { key: 3, type: "li", props: { children: "Item 3" } },
];

// Diff 结果：只删除 key=2 的节点，其他节点保持不变
// 1. 保持 key=1 的节点在位置 0
// 2. 删除 key=2 的节点
// 3. 移动 key=3 的节点到位置 1
```

## 性能对比

### 1. 时间复杂度

| 场景     | 没有 Key | 有 Key |
| -------- | -------- | ------ |
| 列表渲染 | O(n²)    | O(n)   |
| 列表更新 | O(n²)    | O(n)   |
| 列表删除 | O(n²)    | O(n)   |
| 列表插入 | O(n²)    | O(n)   |

### 2. DOM 操作次数

```javascript
// 示例：1000 个项目的列表删除第一个项目

// 没有 key：需要更新 999 个 DOM 节点
// 1. 将第 2 个项目的内容更新为第 1 个项目的内容
// 2. 将第 3 个项目的内容更新为第 2 个项目的内容
// 3. ... 以此类推
// 4. 删除最后一个节点

// 有 key：只需要删除 1 个 DOM 节点
// 1. 删除 key 对应的 DOM 节点
// 2. 其他节点保持不变
```

## 总结

React Key 的核心价值在于：

1. **优化 Diff 算法**：将 O(n²) 的时间复杂度降低到 O(n)
2. **减少 DOM 操作**：通过复用现有 DOM 节点减少不必要的创建和删除
3. **保持组件状态**：确保组件在重新渲染时保持正确的内部状态
4. **提高渲染性能**：显著减少渲染时间和内存占用

Key 通过为每个虚拟 DOM 节点提供唯一标识符，让 React 能够快速识别哪些节点发生了变化，哪些可以复用，从而实现了高效的 DOM 更新策略。
