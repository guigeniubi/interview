## useState 原理

- React 内部在 Fiber 节点上维护一个 hooks 链表，每次渲染都会按顺序取出对应的 hook。
- `useState(initialState)` 会创建一个 hook 对象，包含 `memoizedState`（当前值）和一个更新队列。
- 调用 `setState` 时，本质是向更新队列里 push 一个更新对象（包含新的 state 或计算函数）。
- 下一次 render 时，React 会遍历更新队列，计算出最新的 state，并更新到 Fiber。

### 为什么是异步的？

- 因为 React 会把多次更新合并，在一次批量 render 中执行，避免频繁刷新。
- 在 React18 之后，批处理范围扩大到 Promise/timeout 等异步场景。

## useReducer 原理

- 和 useState 类似，也是基于 hooks 链表存储状态。
- 区别在于它把更新逻辑抽象到 `reducer(state, action)` 函数中。
- 调用 `dispatch(action)` 会把 action 放入更新队列，下一次 render 时用 reducer 计算新的 state。

### 使用场景

- 当状态更新逻辑复杂（多个条件分支、不同 action 类型）时，更适合用 useReducer。
- 这样可以把逻辑集中到 reducer，组件内部更简洁，可维护性更好。
