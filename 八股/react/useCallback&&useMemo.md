# useCallback 和 useMemo 详解

> useCallback 和 useMemo 是 React 中用于性能优化的两个重要 Hook，它们通过缓存来避免不必要的重新计算和重新渲染。

## 目录

- [基本概念](#基本概念)
- [useCallback 详解](#usecallback-详解)
- [useMemo 详解](#usememo-详解)
- [区别对比](#区别对比)
- [实现原理](#实现原理)
- [使用场景](#使用场景)
- [最佳实践](#最佳实践)

## 基本概念

### 为什么需要缓存？

在 React 中，每次组件重新渲染时，函数和对象都会重新创建，这可能导致：

1. **子组件不必要的重新渲染**
2. **昂贵的计算重复执行**
3. **依赖数组失效**

```javascript
// ❌ 问题示例：每次渲染都创建新函数
function ParentComponent() {
  const [count, setCount] = useState(0);

  // 每次渲染都会创建新的函数引用
  const handleClick = () => {
    console.log("Button clicked");
  };

  return (
    <div>
      <button onClick={() => setCount(count + 1)}>Count: {count}</button>
      <ChildComponent onButtonClick={handleClick} />
    </div>
  );
}

// ChildComponent 会不必要地重新渲染
const ChildComponent = React.memo(({ onButtonClick }) => {
  console.log("ChildComponent rendered");
  return <button onClick={onButtonClick}>Click me</button>;
});
```

## useCallback 详解

### 基本语法

```javascript
const memoizedCallback = useCallback(() => {
  doSomething(a, b);
}, [a, b]);
```

### 工作原理

useCallback 返回一个**记忆化的回调函数**，只有当依赖项发生变化时，才会创建新的函数引用。

```javascript
import React, { useState, useCallback } from "react";

function OptimizedParent() {
  const [count, setCount] = useState(0);
  const [text, setText] = useState("");

  // 只有当 count 变化时才创建新函数
  const handleCountClick = useCallback(() => {
    console.log("Count button clicked, count:", count);
  }, [count]);

  // 只有当 text 变化时才创建新函数
  const handleTextClick = useCallback(() => {
    console.log("Text button clicked, text:", text);
  }, [text]);

  // 永远不会创建新函数（空依赖数组）
  const handleStaticClick = useCallback(() => {
    console.log("Static button clicked");
  }, []);

  return (
    <div>
      <input value={text} onChange={(e) => setText(e.target.value)} />
      <button onClick={() => setCount(count + 1)}>Count: {count}</button>

      <ChildComponent
        onCountClick={handleCountClick}
        onTextClick={handleTextClick}
        onStaticClick={handleStaticClick}
      />
    </div>
  );
}

// 使用 React.memo 优化子组件
const ChildComponent = React.memo(
  ({ onCountClick, onTextClick, onStaticClick }) => {
    console.log("ChildComponent rendered");

    return (
      <div>
        <button onClick={onCountClick}>Count Action</button>
        <button onClick={onTextClick}>Text Action</button>
        <button onClick={onStaticClick}>Static Action</button>
      </div>
    );
  }
);
```

## useMemo 详解

### 基本语法

```javascript
const memoizedValue = useMemo(() => computeExpensiveValue(a, b), [a, b]);
```

### 工作原理

useMemo 返回一个**记忆化的值**，只有当依赖项发生变化时，才会重新计算。

```javascript
import React, { useState, useMemo } from "react";

function ExpensiveComponent({ items, filter }) {
  const [count, setCount] = useState(0);

  // 昂贵的计算：只有当 items 或 filter 变化时才重新计算
  const filteredItems = useMemo(() => {
    console.log("Computing filtered items...");
    return items.filter((item) =>
      item.name.toLowerCase().includes(filter.toLowerCase())
    );
  }, [items, filter]);

  // 另一个昂贵的计算：只有当 items 变化时才重新计算
  const totalPrice = useMemo(() => {
    console.log("Computing total price...");
    return items.reduce((sum, item) => sum + item.price, 0);
  }, [items]);

  // 静态值：永远不会重新计算
  const staticValue = useMemo(() => {
    console.log("Computing static value...");
    return "This value never changes";
  }, []);

  return (
    <div>
      <button onClick={() => setCount(count + 1)}>
        Re-render count: {count}
      </button>

      <div>
        <h3>Filtered Items ({filteredItems.length}):</h3>
        <ul>
          {filteredItems.map((item) => (
            <li key={item.id}>
              {item.name} - ${item.price}
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h3>Total Price: ${totalPrice}</h3>
        <p>{staticValue}</p>
      </div>
    </div>
  );
}
```

## 区别对比

| 特性         | useCallback            | useMemo              |
| ------------ | ---------------------- | -------------------- |
| **返回类型** | 函数                   | 任意值               |
| **主要用途** | 缓存函数引用           | 缓存计算结果         |
| **适用场景** | 传递给子组件的回调函数 | 昂贵的计算、对象创建 |
| **性能影响** | 减少子组件重新渲染     | 避免重复计算         |
| **依赖项**   | 函数内部使用的变量     | 计算所需的变量       |

### 详细对比示例

```javascript
import React, { useState, useCallback, useMemo } from "react";

function ComparisonExample() {
  const [count, setCount] = useState(0);
  const [items, setItems] = useState([1, 2, 3, 4, 5]);

  // useCallback: 缓存函数引用
  const handleClick = useCallback(() => {
    console.log("Button clicked, count:", count);
  }, [count]);

  // useMemo: 缓存计算结果
  const expensiveValue = useMemo(() => {
    console.log("Computing expensive value...");
    return items.reduce((sum, item) => sum + item * 2, 0);
  }, [items]);

  // useMemo: 缓存对象
  const memoizedObject = useMemo(
    () => ({
      count,
      items: items.length,
      expensiveValue,
    }),
    [count, items.length, expensiveValue]
  );

  return (
    <div>
      <button onClick={() => setCount(count + 1)}>Count: {count}</button>
      <button onClick={() => setItems([...items, items.length + 1])}>
        Add Item
      </button>

      <ChildComponent onButtonClick={handleClick} data={memoizedObject} />

      <p>Expensive Value: {expensiveValue}</p>
    </div>
  );
}
```

## 实现原理

### React 内部的实现机制

React 使用**依赖数组比较**来决定是否需要重新创建值：

```javascript
// 简化的实现原理
function useCallback(callback, deps) {
  const currentHook = getCurrentHook();

  // 检查依赖项是否变化
  const depsChanged = !areHookInputsEqual(deps, currentHook.memoizedState);

  if (depsChanged) {
    // 依赖项变化，创建新的回调函数
    currentHook.memoizedState = deps;
    currentHook.memoizedCallback = callback;
  }

  return currentHook.memoizedCallback;
}

function useMemo(create, deps) {
  const currentHook = getCurrentHook();

  // 检查依赖项是否变化
  const depsChanged = !areHookInputsEqual(deps, currentHook.memoizedState);

  if (depsChanged) {
    // 依赖项变化，重新计算值
    currentHook.memoizedState = deps;
    currentHook.memoizedValue = create();
  }

  return currentHook.memoizedValue;
}
```

### 依赖项比较机制

```javascript
// React 内部的依赖项比较（简化版）
function areHookInputsEqual(nextDeps, prevDeps) {
  if (prevDeps === null) {
    return false;
  }

  for (let i = 0; i < prevDeps.length && i < nextDeps.length; i++) {
    if (Object.is(nextDeps[i], prevDeps[i])) {
      continue;
    }
    return false;
  }

  return true;
}
```

## 使用场景

### useCallback 适用场景

1. **传递给子组件的回调函数**
2. **作为 useEffect 的依赖项**
3. **避免子组件不必要的重新渲染**

```javascript
// 场景1：传递给子组件的回调
function ParentComponent() {
  const [data, setData] = useState([]);

  const handleItemClick = useCallback((itemId) => {
    console.log("Item clicked:", itemId);
    // 处理点击逻辑
  }, []); // 空依赖数组，函数引用永远不变

  return (
    <div>
      {data.map((item) => (
        <ItemComponent key={item.id} item={item} onClick={handleItemClick} />
      ))}
    </div>
  );
}

// 场景2：作为 useEffect 的依赖项
function DataFetcher({ userId }) {
  const [data, setData] = useState(null);

  const fetchData = useCallback(async () => {
    const response = await fetch(`/api/user/${userId}`);
    const result = await response.json();
    setData(result);
  }, [userId]); // 依赖 userId

  useEffect(() => {
    fetchData();
  }, [fetchData]); // 依赖 fetchData

  return <div>{/* 渲染数据 */}</div>;
}
```

### useMemo 适用场景

1. **昂贵的计算**
2. **避免重复创建对象/数组**
3. **优化渲染性能**

```javascript
// 场景1：昂贵的计算
function ExpensiveCalculation({ numbers }) {
  const sortedNumbers = useMemo(() => {
    console.log("Sorting numbers...");
    return [...numbers].sort((a, b) => a - b);
  }, [numbers]);

  const sum = useMemo(() => {
    console.log("Calculating sum...");
    return numbers.reduce((acc, num) => acc + num, 0);
  }, [numbers]);

  return (
    <div>
      <p>Sorted: {sortedNumbers.join(", ")}</p>
      <p>Sum: {sum}</p>
    </div>
  );
}

// 场景2：避免重复创建对象
function UserProfile({ user }) {
  const userInfo = useMemo(
    () => ({
      name: user.name,
      email: user.email,
      avatar: user.avatar || "/default-avatar.png",
      isActive: user.lastLogin > Date.now() - 24 * 60 * 60 * 1000,
    }),
    [user.name, user.email, user.avatar, user.lastLogin]
  );

  return <UserCard userInfo={userInfo} />;
}
```

## 最佳实践

### 1. 合理使用依赖数组

```javascript
// ✅ 正确：包含所有依赖项
const handleClick = useCallback(() => {
  console.log("Count:", count, "Text:", text);
}, [count, text]);

// ❌ 错误：缺少依赖项
const handleClick = useCallback(() => {
  console.log("Count:", count, "Text:", text);
}, [count]); // 缺少 text 依赖

// ✅ 正确：使用函数式更新避免依赖
const handleClick = useCallback(() => {
  setCount((prevCount) => prevCount + 1);
}, []); // 不需要依赖 count
```

### 2. 避免过度优化

```javascript
// ❌ 过度优化：简单的计算不需要 useMemo
const simpleValue = useMemo(() => count * 2, [count]);

// ✅ 正确：直接计算
const simpleValue = count * 2;

// ✅ 正确：复杂计算才使用 useMemo
const expensiveValue = useMemo(() => {
  return items.reduce((sum, item) => {
    return sum + complexCalculation(item);
  }, 0);
}, [items]);
```

### 3. 结合 React.memo 使用

```javascript
// 父组件
function ParentComponent() {
  const [count, setCount] = useState(0);

  const handleClick = useCallback(() => {
    console.log("Button clicked");
  }, []); // 空依赖数组

  return (
    <div>
      <button onClick={() => setCount(count + 1)}>Count: {count}</button>
      <OptimizedChild onButtonClick={handleClick} />
    </div>
  );
}

// 子组件使用 React.memo
const OptimizedChild = React.memo(({ onButtonClick }) => {
  console.log("OptimizedChild rendered");
  return <button onClick={onButtonClick}>Click me</button>;
});
```

### 4. 性能监控

```javascript
// 使用 React DevTools Profiler 监控性能
function ProfiledComponent() {
  const [data, setData] = useState([]);

  const processedData = useMemo(() => {
    console.log("Processing data...");
    return data.map((item) => ({
      ...item,
      processed: true,
      timestamp: Date.now(),
    }));
  }, [data]);

  return (
    <div>
      {processedData.map((item) => (
        <DataItem key={item.id} item={item} />
      ))}
    </div>
  );
}
```

## 常见错误

```javascript
// ❌ 错误：在 useCallback 中创建新对象
const handleClick = useCallback(() => {
  setData({ id: 1, name: "test" }); // 每次都创建新对象
}, []);

// ✅ 正确：使用 useMemo 缓存对象
const defaultData = useMemo(() => ({ id: 1, name: "test" }), []);
const handleClick = useCallback(() => {
  setData(defaultData);
}, [defaultData]);

// ❌ 错误：依赖项包含函数
const handleClick = useCallback(() => {
  console.log("Clicked");
}, [someFunction]); // someFunction 每次都是新引用

// ✅ 正确：将函数也缓存
const memoizedFunction = useCallback(() => {
  // 函数逻辑
}, []);
const handleClick = useCallback(() => {
  console.log("Clicked");
  memoizedFunction();
}, [memoizedFunction]);
```

---

> **总结**：useCallback 用于缓存函数引用，useMemo 用于缓存计算结果。合理使用这两个 Hook 可以显著提升 React 应用的性能，但要注意避免过度优化。
